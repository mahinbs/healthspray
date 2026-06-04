import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REFUNDABLE_STATUSES = ["paid", "processing", "shipped", "delivered", "return_requested"];

async function generateHMAC(params: Record<string, string>, secretKey: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const message = sortedKeys.map((k) => params[k]).join("");
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const log = (msg: string, data?: unknown) => console.log(`[icici-refund] ${msg}`, data ?? "");
  const errLog = (msg: string, data?: unknown) => console.error(`[icici-refund] ${msg}`, data ?? "");

  try {
    const { orderId, reason, manual } = await req.json();
    if (!orderId) throw new Error("orderId is required");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: order, error: orderErr } = await supabaseService
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) throw new Error("Order not found");
    if (order.status === "refunded") {
      return new Response(
        JSON.stringify({ success: true, message: "Already refunded", orderId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      throw new Error(`Cannot refund order with status: ${order.status}`);
    }
    if (!order.icici_txn_no && !manual) {
      throw new Error("No ICICI transaction on this order. Use manual refund or mark return first.");
    }

    const refundAmountPaise = order.refund_amount ?? order.amount;
    let iciciRefundRef: string | null = null;

    const merchantId = Deno.env.get("ICICI_MERCHANT_ID") ?? "";
    const secretKey = Deno.env.get("ICICI_SECRET_KEY") ?? "";
    const refundApiUrl =
      Deno.env.get("ICICI_REFUND_API_URL") ??
      "https://pgpayuat.icicibank.com/tsp/pg/api/v2/refund";

    if (!manual && merchantId && secretKey && order.icici_txn_no) {
      const refundTxnNo = `RF${Date.now()}`.slice(0, 20);
      const amountStr = (refundAmountPaise / 100).toFixed(2);

      const requestParams: Record<string, string> = {
        merchantId,
        merchantTxnNo: refundTxnNo,
        originalMerchantTxnNo: order.icici_txn_no,
        amount: amountStr,
        currencyCode: "356",
      };

      const aggregatorId = Deno.env.get("ICICI_AGGREGATOR_ID");
      if (aggregatorId) requestParams.aggregatorID = aggregatorId;

      const secureHash = await generateHMAC(requestParams, secretKey);
      const finalRequest = { ...requestParams, secureHash };

      log("Calling ICICI refund API", { refundTxnNo, original: order.icici_txn_no });

      try {
        const iciciResponse = await fetch(refundApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalRequest),
        });
        const iciciText = await iciciResponse.text();
        log("ICICI refund response", iciciText);

        if (iciciResponse.ok) {
          const iciciData = JSON.parse(iciciText);
          if (iciciData.responseCode === "R1000" || iciciData.status === "SUCCESS") {
            iciciRefundRef = iciciData.refundId ?? iciciData.txnId ?? refundTxnNo;
          } else {
            errLog("ICICI refund declined", iciciData);
            throw new Error(
              iciciData.responseDescription ??
                `ICICI refund failed: ${iciciData.responseCode ?? "unknown"}`,
            );
          }
        } else {
          throw new Error(`ICICI refund HTTP ${iciciResponse.status}`);
        }
      } catch (apiErr) {
        const msg = apiErr instanceof Error ? apiErr.message : "ICICI refund API error";
        if (!manual) {
          throw new Error(
            `${msg}. Use "Record manual refund" in admin after processing payout in ICICI merchant portal.`,
          );
        }
        log("ICICI API skipped/failed, manual path", msg);
      }
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabaseService
      .from("orders")
      .update({
        status: "refunded",
        return_reason: reason ?? order.return_reason ?? "Customer return",
        return_requested_at: order.return_requested_at ?? now,
        refunded_at: now,
        refund_amount: refundAmountPaise,
        icici_refund_ref: iciciRefundRef,
        refund_notes: manual
          ? "Manual refund recorded by admin (verify in ICICI merchant dashboard)"
          : iciciRefundRef
            ? `ICICI refund ref: ${iciciRefundRef}`
            : null,
        updated_at: now,
      })
      .eq("id", orderId);

    if (updateErr) throw updateErr;

    // Notify customer (non-blocking)
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ orderId, eventType: "order_refunded" }),
    }).catch((e) => errLog("Notification failed", e));

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        iciciRefundRef,
        manual: Boolean(manual),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    errLog("Refund failed", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Refund failed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
