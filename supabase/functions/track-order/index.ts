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
    const { orderId, email } = await req.json();
    if (!orderId || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Order ID and email are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const normalizedInput = normalizeEmail(email);
    const idInput = String(orderId).trim();

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let order: Record<string, unknown> | null = null;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idInput)) {
      const { data, error } = await supabaseService
        .from("orders")
        .select(
          "id, amount, status, items, delivery_address, created_at, updated_at, invoice_number, invoice_url, guest_email, user_id, coupon_code, coupon_discount"
        )
        .eq("id", idInput)
        .maybeSingle();
      if (error) throw error;
      order = data;
    } else {
      const short = idInput.replace(/^#/, "").toLowerCase();
      if (short.length < 8) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid order reference" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      const { data, error } = await supabaseService.rpc("find_order_by_id_prefix", {
        prefix: short,
      });
      if (error) throw error;
      const rows = (data ?? []) as Record<string, unknown>[];
      order = rows.length === 1 ? rows[0] : null;
    }

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found. Check your order ID and email." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const allowed = orderEmails(order as { guest_email?: string | null; delivery_address?: Record<string, string> | null });
    if (order.user_id) {
      const { data: usr } = await supabaseService.auth.admin.getUserById(order.user_id as string);
      if (usr?.user?.email) allowed.push(normalizeEmail(usr.user.email));
    }

    if (!allowed.includes(normalizedInput)) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found. Check your order ID and email." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          status: order.status,
          items: order.items,
          delivery_address: order.delivery_address,
          created_at: order.created_at,
          updated_at: order.updated_at,
          invoice_number: order.invoice_number,
          invoice_url: order.invoice_url,
          coupon_code: order.coupon_code,
          coupon_discount: order.coupon_discount,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[track-order]", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
