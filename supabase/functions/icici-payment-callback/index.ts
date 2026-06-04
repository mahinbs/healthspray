import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await req.text();
      log("Received form body", body.substring(0, 200));
      for (const pair of body.split('&')) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx > -1) {
          const key = decodeURIComponent(pair.substring(0, eqIdx));
          const value = decodeURIComponent(pair.substring(eqIdx + 1));
          params[key] = value;
        }
      }
    } else {
      // Try JSON fallback
      const body = await req.text();
      log("Non-form body received", body.substring(0, 200));
      try {
        params = JSON.parse(body);
      } catch {
        params = {};
      }
    }

    log("Parsed params keys", Object.keys(params).join(', '));

    const secretKey = Deno.env.get("ICICI_SECRET_KEY") ?? "";
    const receivedHash = params.secureHash ?? "";

    // Verify secureHash
    const paramsForHash = { ...params };
    delete paramsForHash.secureHash;

    const expectedHash = await generateHMAC(paramsForHash, secretKey);

    if (receivedHash.toLowerCase() !== expectedHash.toLowerCase()) {
      errLog("SecureHash mismatch", { received: receivedHash, expected: expectedHash });
      return htmlRedirect(`${appUrl}/payment-callback?status=failed&reason=hash_mismatch`);
    }

    log("SecureHash verified OK");

    const merchantTxnNo = params.merchantTxnNo ?? "";
    const responseCode = params.responseCode ?? "";
    const isSuccess = responseCode === "0000";
    const iciciTxnId = params.txnID ?? "";
    const iciciPaymentId = params.paymentID ?? "";
    const paymentMode = params.paymentMode ?? "";

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

    // Update order status and ICICI details
    const { error: updateErr } = await supabaseService
      .from("orders")
      .update({
        status: newStatus,
        icici_txn_id: iciciTxnId,
        icici_payment_id: iciciPaymentId,
        payment_mode: paymentMode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateErr) {
      errLog("Failed to update order", updateErr);
    } else {
      log("Order updated", { orderId: order.id, status: newStatus });
    }

    // Handle coupon usage on success
    if (isSuccess && order.coupon_code) {
      const { data: coupon } = await supabaseService
        .from('coupons')
        .select('id')
        .eq('code', order.coupon_code)
        .maybeSingle();

      if (coupon?.id) {
        await supabaseService.from('coupon_usages').insert({
          coupon_id: coupon.id,
          user_id: order.user_id,
          order_id: order.id,
        }).catch(() => {});
        await supabaseService.rpc('increment_coupon_total_usage', { code: order.coupon_code }).catch(() => {});
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
      }).catch(() => {});
    }

    const status = isSuccess ? "success" : "failed";
    return htmlRedirect(`${appUrl}/payment-callback?status=${status}&orderId=${order.id}${trackQuery}`);

  } catch (error) {
    errLog("Unhandled error", error);
    return htmlRedirect(`${appUrl}/payment-callback?status=failed&reason=server_error`);
  }
});
