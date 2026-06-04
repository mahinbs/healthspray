import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ORDER_SELECT =
  "id, amount, status, items, delivery_address, created_at, updated_at, invoice_number, invoice_url, guest_email, user_id, coupon_code, coupon_discount, shipping_fee, service_charge, total_paid, payment_mode, payment_sub_inst_type";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeRef(input: string): string {
  return input.trim().replace(/^#/, "").replace(/-/g, "").toLowerCase();
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

function matchesReference(orderId: string, refInput: string): boolean {
  const ref = normalizeRef(refInput);
  if (ref.length < 6) return false;
  const compact = orderId.replace(/-/g, "").toLowerCase();
  const lower = orderId.toLowerCase();
  return (
    compact.includes(ref) ||
    compact.endsWith(ref) ||
    compact.startsWith(ref) ||
    lower.endsWith(ref) ||
    lower.startsWith(ref)
  );
}

function parseUuid(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, "");
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) return trimmed.toLowerCase();

  const compact = normalizeRef(trimmed);
  if (compact.length === 32 && /^[0-9a-f]+$/.test(compact)) {
    return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
  }
  return null;
}

async function findByReference(
  supabase: ReturnType<typeof createClient>,
  refInput: string
): Promise<Record<string, unknown>[]> {
  const fullUuid = parseUuid(refInput);
  if (fullUuid) {
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", fullUuid)
      .maybeSingle();
    if (error) throw error;
    return data ? [data as Record<string, unknown>] : [];
  }

  const short = normalizeRef(refInput);
  if (short.length < 6) return [];

  const { data: rpcData, error: rpcError } = await supabase.rpc("find_order_by_id_prefix", {
    prefix: refInput.trim().replace(/^#/, ""),
  });

  if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
    return rpcData as Record<string, unknown>[];
  }

  if (rpcError) {
    console.warn("[track-order] RPC fallback:", rpcError.message);
  }

  const { data: recent, error: recentErr } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(300);

  if (recentErr) throw recentErr;

  return ((recent ?? []) as Record<string, unknown>[]).filter((o) =>
    matchesReference(String(o.id ?? ""), refInput)
  );
}

async function emailAllowed(
  supabase: ReturnType<typeof createClient>,
  order: Record<string, unknown>,
  normalizedEmail: string
): Promise<boolean> {
  const allowed = orderEmails(order as { guest_email?: string | null; delivery_address?: Record<string, string> | null });
  if (order.user_id) {
    const { data: usr } = await supabase.auth.admin.getUserById(order.user_id as string);
    if (usr?.user?.email) allowed.push(normalizeEmail(usr.user.email));
  }
  return allowed.includes(normalizedEmail);
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
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const candidates = await findByReference(supabaseService, String(orderId));

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order not found. Use the 8-character code from your invoice (e.g. #FB11E620) or full order ID.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    let order: Record<string, unknown> | null = null;
    for (const candidate of candidates) {
      if (await emailAllowed(supabaseService, candidate, normalizedInput)) {
        order = candidate;
        break;
      }
    }

    if (!order) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No order found for this ID and email. Check the code on your invoice and the email used at checkout.",
        }),
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
          shipping_fee: order.shipping_fee,
          service_charge: order.service_charge,
          total_paid: order.total_paid,
          payment_mode: order.payment_mode,
          payment_sub_inst_type: order.payment_sub_inst_type,
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
