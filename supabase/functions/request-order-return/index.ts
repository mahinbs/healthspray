import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function orderEmails(order: {
  guest_email?: string | null;
  delivery_address?: Record<string, string> | null;
}): string[] {
  const emails: string[] = [];
  if (order.guest_email) emails.push(normalizeEmail(order.guest_email));
  const addrEmail = order.delivery_address?.email;
  if (addrEmail) emails.push(normalizeEmail(addrEmail));
  return [...new Set(emails)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, email, reason } = await req.json();
    if (!orderId || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Order ID and email are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, items, delivery_address, guest_email, user_id, delivered_at, updated_at, return_requested_at")
      .eq("id", String(orderId).trim())
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const allowed = orderEmails(order);
    if (order.user_id) {
      const { data: usr } = await supabase.auth.admin.getUserById(order.user_id);
      if (usr?.user?.email) allowed.push(normalizeEmail(usr.user.email));
    }
    if (!allowed.includes(normalizeEmail(email))) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found for this email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const { data: store } = await supabase
      .from("store_settings")
      .select("returns_enabled, return_window_days")
      .eq("id", "default")
      .maybeSingle();

    if (store?.returns_enabled === false) {
      return new Response(
        JSON.stringify({ success: false, error: "Returns are not available for this store." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const storeWindow = Number(store?.return_window_days ?? 7);

    if (order.status === "return_requested") {
      return new Response(
        JSON.stringify({ success: false, error: "A return has already been requested for this order." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (order.status === "refunded") {
      return new Response(
        JSON.stringify({ success: false, error: "This order has already been refunded." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (order.status !== "delivered") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You can request a return only after your order is marked as delivered.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const deliveredAt = order.delivered_at
      ? new Date(order.delivered_at)
      : new Date(order.updated_at);

    const items = (order.items ?? []) as Array<{ product?: { id?: string } }>;
    let windowDays = storeWindow;

    for (const item of items) {
      const pid = item.product?.id;
      if (!pid) continue;
      const { data: product } = await supabase
        .from("products")
        .select("return_window_days")
        .eq("id", pid)
        .maybeSingle();
      const days =
        product?.return_window_days != null
          ? Number(product.return_window_days)
          : storeWindow;
      windowDays = Math.min(windowDays, days);
    }

    const daysSince = Math.floor((Date.now() - deliveredAt.getTime()) / (86400000));
    if (daysSince > windowDays) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Return window expired. Returns must be requested within ${windowDays} day(s) of delivery.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "return_requested",
        return_reason: (reason ?? "").trim() || "Customer return request",
        return_requested_at: now,
        updated_at: now,
      })
      .eq("id", order.id);

    if (updateErr) throw updateErr;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ orderId: order.id, eventType: "order_return_requested" }),
    }).catch(() => {});

    return new Response(
      JSON.stringify({
        success: true,
        message: "Return request submitted. Our team will review it and process your refund after approval.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[request-order-return]", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
