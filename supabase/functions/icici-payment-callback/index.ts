import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  calculateServiceCharge,
  formatPaymentModeLabel,
} from "../_shared/orderBreakdown.ts";

// This function receives POST from ICICI (browser redirect after payment)
// verify_jwt = false in config.toml

async function generateHMAC(params: Record<string, string>, secretKey: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const message = sortedKeys.map(k => params[k]).join('');
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function htmlRedirect(url: string): Response {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting...</title></head>
<body><p>Processing your payment, please wait...</p>
<script>window.location.replace("${url}");</script></body></html>`,
    { headers: { "Content-Type": "text/html" }, status: 200 }
  );
}

serve(async (req) => {
  const log = (msg: string, data?: unknown) => console.log(`[icici-callback] ${msg}`, data ?? '');
  const errLog = (msg: string, data?: unknown) => console.error(`[icici-callback] ${msg}`, data ?? '');

  const appUrl = Deno.env.get("APP_URL") ?? "https://gielqkfnsypadbplaaci.vercel.app";

  // Accept both POST (ICICI redirect) and GET (health check)
  if (req.method === "GET") {
    return new Response("ICICI Payment Callback endpoint is active", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  let params: Record<string, string> = {};

  try {
    const contentType = req.headers.get("content-type") ?? "";

    // Parse body regardless of content-type
    const rawBody = await req.text();
    log("Raw body (first 300)", rawBody.substring(0, 300));
    log("Content-Type", contentType);

    // Always try form-encoded first, then JSON
    if (rawBody.includes('=') && !rawBody.trimStart().startsWith('{')) {
      // application/x-www-form-urlencoded
      // NOTE: decodeURIComponent does NOT decode '+' as space — must replace first
      for (const pair of rawBody.split('&')) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx > -1) {
          const key = decodeURIComponent(pair.substring(0, eqIdx).replace(/\+/g, ' '));
          const value = decodeURIComponent(pair.substring(eqIdx + 1).replace(/\+/g, ' '));
          params[key] = value;
        }
      }
    } else {
      try {
        params = JSON.parse(rawBody);
      } catch {
        params = {};
      }
    }

    log("Parsed params", JSON.stringify(params).substring(0, 400));

    const secretKey = Deno.env.get("ICICI_SECRET_KEY") ?? "";
    log("Secret key length", secretKey.length); // should be 36 for the UUID key
    const receivedHash = params.secureHash ?? "";

    // Verify secureHash
    const paramsForHash = { ...params };
    delete paramsForHash.secureHash;

    const sortedKeys = Object.keys(paramsForHash).sort();
    const hashMessage = sortedKeys.map(k => paramsForHash[k]).join('');
    log("Hash message (first 200)", hashMessage.substring(0, 200));
    log("Hash keys sorted", sortedKeys.join(','));

    const expectedHash = await generateHMAC(paramsForHash, secretKey);

    log("Received hash", receivedHash);
    log("Expected hash", expectedHash);

    if (receivedHash.toLowerCase() !== expectedHash.toLowerCase()) {
      errLog("SecureHash MISMATCH", { received: receivedHash, expected: expectedHash, keyLen: secretKey.length });
      // ⚠️ UAT DEBUG: skip hash check temporarily to test full flow
      // Comment out the return below once hash is working
      return htmlRedirect(`${appUrl}/payment-callback?status=failed&reason=hash_mismatch`);
    }

    log("SecureHash verified OK");

    const merchantTxnNo    = params.merchantTxnNo ?? "";
    const responseCode     = params.responseCode ?? "";
    const isSuccess        = responseCode === "0000";
    const iciciTxnId       = params.txnID ?? "";
    const iciciPaymentId   = params.paymentID ?? "";
    const paymentMode      = params.paymentMode ?? "";
    const paymentSubInst   = params.paymentSubInstType ?? "";

    if (!merchantTxnNo) {
      errLog("No merchantTxnNo in callback");
      return htmlRedirect(`${appUrl}/payment-callback?status=failed&reason=invalid_response`);
    }

    // Find order by merchantTxnNo
    const { data: order, error: orderErr } = await supabaseService
      .from("orders")
      .select("*")
      .eq("icici_txn_no", merchantTxnNo)
      .single();

    if (orderErr || !order) {
      errLog("Order not found for txn", merchantTxnNo);
      return htmlRedirect(`${appUrl}/payment-callback?status=failed&reason=order_not_found`);
    }

    log("Found order", { orderId: order.id, currentStatus: order.status });

    const addr = (order.delivery_address ?? {}) as Record<string, string>;
    const trackEmail = encodeURIComponent(
      (order.guest_email as string) ?? addr.email ?? ""
    );
    const trackQuery = trackEmail
      ? `&email=${trackEmail}`
      : "";

    // Idempotency: don't process twice
    if (order.status === "paid") {
      log("Order already paid, redirecting to success");
      return htmlRedirect(`${appUrl}/payment-callback?status=success&orderId=${order.id}${trackQuery}`);
    }

    const newStatus = isSuccess ? "paid" : "failed";

    // Calculate service charge based on payment mode
    const amountRupees = (order.amount as number) / 100;
    const serviceCharge = isSuccess
      ? calculateServiceCharge(amountRupees, paymentMode, paymentSubInst)
      : 0;
    const totalPaid = isSuccess ? amountRupees + serviceCharge : amountRupees;

    // Update order status and ICICI details
    const paymentModeLabel = formatPaymentModeLabel(paymentMode, paymentSubInst);

    const { error: updateErr } = await supabaseService
      .from("orders")
      .update({
        status: newStatus,
        icici_txn_id: iciciTxnId,
        icici_payment_id: iciciPaymentId,
        payment_mode: paymentModeLabel,
        payment_sub_inst_type: paymentSubInst || null,
        service_charge: serviceCharge,
        total_paid: totalPaid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateErr) {
      errLog("Failed to update order", updateErr);
    } else {
      log("Order updated", { orderId: order.id, status: newStatus });
    }

    // Handle coupon usage on success — wrapped in try/catch so it never crashes the redirect
    if (isSuccess && order.coupon_code) {
      try {
        const { data: coupon } = await supabaseService
          .from('coupons')
          .select('id')
          .eq('code', order.coupon_code)
          .maybeSingle();

        if (coupon?.id) {
          if (order.user_id) {
            await supabaseService.from('coupon_usages').insert({
              coupon_id: coupon.id,
              user_id: order.user_id,
              order_id: order.id,
            });
          } else {
            const addrLocal = (order.delivery_address ?? {}) as Record<string, string>;
            const guestEmail = (order.guest_email as string) ?? addrLocal.email ?? null;
            const guestPhone = addrLocal.phone ?? null;
            if (guestEmail || guestPhone) {
              await supabaseService.from('guest_coupon_usages').insert({
                coupon_id: coupon.id,
                coupon_code: order.coupon_code,
                email: guestEmail,
                phone: guestPhone,
                order_id: order.id,
              });
            }
          }
          await supabaseService.rpc('increment_coupon_total_usage', { code: order.coupon_code });
        }
      } catch (couponErr) {
        errLog("Coupon recording error (non-fatal)", couponErr);
      }
    }

    // Trigger invoice generation and notifications asynchronously (don't block redirect)
    if (isSuccess) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

      // Fire and forget - don't await to avoid blocking the browser redirect
      (async () => {
        try {
          // Generate invoice
          const invRes = await fetch(`${supabaseUrl}/functions/v1/generate-invoice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ orderId: order.id }),
          });
          const invData = await invRes.json();
          log("Invoice generated", invData);
        } catch (e) {
          errLog("Invoice generation error", e);
        }

        try {
          // Send notifications
          const notifRes = await fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ orderId: order.id, eventType: "payment_confirmed" }),
          });
          const notifData = await notifRes.json();
          log("Notifications sent", notifData);
        } catch (e) {
          errLog("Notification error", e);
        }
      })();
    } else {
      // Send failed payment notification
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ orderId: order.id, eventType: "payment_failed" }),
      }).then(() => {}).catch(() => {});
    }

    const status = isSuccess ? "success" : "failed";
    return htmlRedirect(`${appUrl}/payment-callback?status=${status}&orderId=${order.id}${trackQuery}`);

  } catch (error) {
    errLog("Unhandled error", error);
    return htmlRedirect(`${appUrl}/payment-callback?status=failed&reason=server_error`);
  }
});
