import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function generateMerchantTxnNo(): string {
  const now = new Date();
  const ts =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return (ts + random).substring(0, 20);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const log = (msg: string, data?: unknown) => console.log(`[icici-initiate] ${msg}`, data ?? '');
  const errLog = (msg: string, data?: unknown) => console.error(`[icici-initiate] ${msg}`, data ?? '');

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    let user: { id: string; email?: string | null } | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
      if (!authError && userData.user) {
        user = userData.user;
        log("User authenticated", user.id);
      }
    }
    log(user ? "Authenticated checkout" : "Guest checkout");

    const body = await req.json();
    const { amount, items, deliveryAddress, idempotency_key, coupon } = body;

    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!items || items.length === 0) throw new Error("No items in cart");
    if (!deliveryAddress) throw new Error("Delivery address required");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let subtotal = 0;
    for (const item of items) {
      const price = Number(item.product?.price ?? 0);
      const qty = Number(item.quantity ?? 1);
      if (!Number.isFinite(price) || !Number.isFinite(qty) || qty < 1) {
        throw new Error("Invalid cart item");
      }
      subtotal += price * qty;
    }

    let discount = 0;
    if (coupon?.code) {
      const { data: dbCoupon } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('code', coupon.code)
        .eq('is_active', true)
        .maybeSingle();

      if (dbCoupon) {
        const now = new Date();
        if (now >= new Date(dbCoupon.starts_at) && now <= new Date(dbCoupon.ends_at)) {
          if (dbCoupon.type === 'percentage') {
            discount = subtotal * Number(dbCoupon.value) / 100;
            if (dbCoupon.max_discount != null) {
              discount = Math.min(discount, Number(dbCoupon.max_discount));
            }
          } else {
            discount = Number(dbCoupon.value);
          }
          discount = Math.min(discount, subtotal);
        }
      }
    } else if (coupon?.discount != null) {
      discount = Math.min(Number(coupon.discount), subtotal);
    }

    const afterDiscount = Math.max(0, subtotal - discount);

    const { data: storeSettings } = await supabaseService
      .from("store_settings")
      .select("free_shipping_minimum, delivery_charge")
      .eq("id", "default")
      .maybeSingle();

    const freeMin = Number(storeSettings?.free_shipping_minimum ?? 500);
    const deliveryCharge = Number(storeSettings?.delivery_charge ?? 49);
    const shippingFee =
      afterDiscount <= 0 ? 0 : afterDiscount >= freeMin ? 0 : deliveryCharge;

    const finalAmount = afterDiscount + shippingFee;

    if (Math.abs(finalAmount - Number(amount)) > 0.02) {
      errLog("Amount mismatch", { client: amount, server: finalAmount, subtotal, discount, shippingFee });
      throw new Error("Order total mismatch. Please refresh your cart and try again.");
    }

    // ICICI config from environment
    const merchantId = Deno.env.get("ICICI_MERCHANT_ID") ?? "";
    const secretKey = Deno.env.get("ICICI_SECRET_KEY") ?? "";
    const aggregatorId = Deno.env.get("ICICI_AGGREGATOR_ID") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const callbackUrl = `${supabaseUrl}/functions/v1/icici-payment-callback`;
    const iciciApiUrl = Deno.env.get("ICICI_API_URL") ?? "https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale";

    if (!merchantId || !secretKey) throw new Error("ICICI credentials not configured");

    const merchantTxnNo = generateMerchantTxnNo();
    const now = new Date();
    const txnDate =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      "235959";

    const amountStr = finalAmount.toFixed(2);

    const requestParams: Record<string, string> = {
      merchantId,
      merchantTxnNo,
      amount: amountStr,
      currencyCode: "356",
      payType: "0",
      customerEmailID: user?.email ?? deliveryAddress.email ?? "customer@example.com",
      customerMobileNo: deliveryAddress.phone ?? "9999999999",
      customerName: deliveryAddress.fullName ?? "Customer",
      transactionType: "SALE",
      txnDate,
      returnURL: callbackUrl,
    };

    if (aggregatorId) requestParams.aggregatorID = aggregatorId;

    const secureHash = await generateHMAC(requestParams, secretKey);
    const finalRequest = { ...requestParams, secureHash };

    log("Calling ICICI initiateSale API", { merchantTxnNo, amount: amountStr });

    const iciciResponse = await fetch(iciciApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalRequest),
    });

    const iciciText = await iciciResponse.text();
    log("ICICI raw response", iciciText);

    if (!iciciResponse.ok) {
      errLog("ICICI API HTTP error", iciciResponse.status);
      throw new Error("Payment gateway unavailable");
    }

    const iciciData = JSON.parse(iciciText);

    if (iciciData.responseCode !== "R1000") {
      errLog("ICICI initiate failed", iciciData);
      throw new Error(`Payment initiation failed: ${iciciData.responseCode || 'Unknown error'}`);
    }

    // Create order in DB (status pending)
    const { data: order, error: dbError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        guest_email: user ? null : (deliveryAddress.email ?? null),
        icici_txn_no: merchantTxnNo,
        amount: Math.round(finalAmount * 100),
        items,
        delivery_address: deliveryAddress,
        status: "pending",
        idempotency_key: idempotency_key || null,
        coupon_code: coupon?.code || null,
        coupon_type: coupon?.type || null,
        coupon_value: coupon?.value ?? null,
        coupon_discount: coupon?.discount ?? null,
      })
      .select()
      .single();

    if (dbError) {
      errLog("DB insert error", dbError);
      throw new Error("Failed to create order in database");
    }

    log("Order created", { orderId: order.id, merchantTxnNo });

    const paymentUrl = `${iciciData.redirectURI}?tranCtx=${iciciData.tranCtx}`;

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl,
        orderId: order.id,
        merchantTxnNo,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    errLog("Error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
