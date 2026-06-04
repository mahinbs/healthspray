import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, data?: unknown) => console.log(`[send-notification] ${msg}`, data ?? "");
const errLog = (msg: string, data?: unknown) => console.error(`[send-notification] ${msg}`, data ?? "");

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND_ORANGE = "#EF4E23";
const BRAND_DARK   = "#c83a10";
const APP_URL      = () => Deno.env.get("APP_URL") ?? "";
const LOGO_URL     = () => `${APP_URL()}/logo-white.png`;

const EVENT_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; tagline: string }> = {
  payment_confirmed: {
    label: "Order Confirmed!",
    icon: "✅",
    color: "#16a34a",
    bg: "#f0fdf4",
    tagline: "Your payment is successful and your order is being prepared.",
  },
  payment_failed: {
    label: "Payment Failed",
    icon: "❌",
    color: "#dc2626",
    bg: "#fef2f2",
    tagline: "We could not process your payment. Please try again.",
  },
  order_shipped: {
    label: "Your Order is on its Way!",
    icon: "🚚",
    color: "#2563eb",
    bg: "#eff6ff",
    tagline: "Your order has been shipped and will reach you soon.",
  },
  order_delivered: {
    label: "Order Delivered!",
    icon: "📦",
    color: "#16a34a",
    bg: "#f0fdf4",
    tagline: "Your order has been delivered. We hope you love it!",
  },
  order_cancelled: {
    label: "Order Cancelled",
    icon: "⚠️",
    color: "#d97706",
    bg: "#fffbeb",
    tagline: "Your order has been cancelled. Refund will be processed in 5–7 business days.",
  },
  order_return_requested: {
    label: "Return Requested",
    icon: "↩️",
    color: "#d97706",
    bg: "#fffbeb",
    tagline: "We received your return request and will process it shortly.",
  },
  order_refunded: {
    label: "Refund Processed",
    icon: "💰",
    color: "#16a34a",
    bg: "#f0fdf4",
    tagline: "Your refund has been processed. It may take 5–7 business days to reflect in your account.",
  },
};

// ─── Email HTML Builder ───────────────────────────────────────────────────────

function trackOrderUrl(order: Record<string, unknown>): string {
  const id = (order.id as string) ?? "";
  const addr = (order.delivery_address ?? {}) as Record<string, string>;
  const email = (order.guest_email as string) ?? addr.email ?? "";
  const params = new URLSearchParams({ orderId: id });
  if (email) params.set("email", email);
  return `${APP_URL()}/track-order?${params.toString()}`;
}

function buildEmailHTML(order: Record<string, unknown>, eventType: string): string {
  const cfg = EVENT_CONFIG[eventType] ?? {
    label: "Order Update",
    icon: "📋",
    color: BRAND_ORANGE,
    bg: "#fff7f5",
    tagline: "Your order status has been updated.",
  };

  const addr  = (order.delivery_address ?? {}) as Record<string, string>;
  const items = (order.items ?? []) as Array<{ product: { name: string; price: number; image?: string; category?: string }; quantity: number }>;
  const invoiceUrl    = (order.invoice_url as string) ?? "";
  const invoiceNumber = (order.invoice_number as string) ?? "";
  const orderId       = ((order.id as string) ?? "").substring(0, 8).toUpperCase();
  const trackUrl      = trackOrderUrl(order);
  const payMode       = (order.payment_mode as string) ?? "Online Payment";
  const totalPaise    = order.amount as number;
  const discPaise     = (order.coupon_discount as number) ?? 0;
  const couponCode    = (order.coupon_code as string) ?? "";

  const formatRs = (p: number) =>
    `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Items rows
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${item.product?.image ? `<img src="${item.product.image}" alt="${item.product?.name}" width="48" height="48" style="border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;" />` : `<div style="width:48px;height:48px;background:#f3f4f6;border-radius:8px;"></div>`}
          <div>
            <div style="font-weight:600;color:#111827;font-size:14px;">${item.product?.name ?? "Product"}</div>
            ${item.product?.category ? `<div style="color:#9ca3af;font-size:12px;margin-top:2px;">${item.product.category}</div>` : ""}
          </div>
        </div>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;font-size:14px;">×${item.quantity}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;color:#111827;font-size:14px;">${formatRs((item.product?.price ?? 0) * item.quantity * 100)}</td>
    </tr>
  `).join("");

  const subtotal = totalPaise + discPaise;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.label}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${cfg.icon} ${cfg.label} — Order #${orderId} | Physiq</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;min-width:320px;">
<tr><td align="center" style="padding:24px 12px 48px;">

  <!-- Card -->
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

    <!-- ═══ HEADER ══════════════════════════════════════════════════════════ -->
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_ORANGE} 0%,${BRAND_DARK} 100%);padding:0;position:relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:32px 36px 28px;">
              <!-- Logo -->
              <img src="${LOGO_URL()}" alt="Physiq" height="38" style="display:block;height:38px;max-width:160px;" />
            </td>
            <td style="padding:32px 36px 28px;text-align:right;vertical-align:middle;">
              <div style="background:rgba(255,255,255,0.18);border-radius:8px;padding:6px 14px;display:inline-block;">
                <span style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;letter-spacing:0.5px;">ORDER #${orderId}</span>
              </div>
            </td>
          </tr>
        </table>
        <!-- Decorative wave bottom -->
        <div style="line-height:0;">
          <svg viewBox="0 0 600 40" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
            <path d="M0,20 C150,40 450,0 600,20 L600,40 L0,40 Z" fill="#ffffff"/>
          </svg>
        </div>
      </td>
    </tr>

    <!-- ═══ STATUS BANNER ════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:28px 36px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:${cfg.bg};border-radius:12px;padding:20px 24px;border-left:4px solid ${cfg.color};">
              <div style="font-size:24px;margin-bottom:8px;">${cfg.icon}</div>
              <div style="font-size:20px;font-weight:700;color:${cfg.color};margin-bottom:6px;">${cfg.label}</div>
              <div style="font-size:14px;color:#6b7280;line-height:1.5;">${cfg.tagline}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ ORDER META ════════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:24px 36px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr style="background:#f9fafb;">
            <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:10px;font-weight:700;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;">Order Details</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;width:50%;">
                    <div style="font-size:11px;color:#9ca3af;margin-bottom:3px;">Order Date</div>
                    <div style="font-size:13px;font-weight:600;color:#111827;">${formatDate(order.created_at as string)}</div>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;width:50%;border-left:1px solid #f3f4f6;">
                    <div style="font-size:11px;color:#9ca3af;margin-bottom:3px;">Payment Method</div>
                    <div style="font-size:13px;font-weight:600;color:#111827;">${payMode}</div>
                  </td>
                </tr>
                ${invoiceNumber ? `
                <tr>
                  <td style="padding:12px 16px;width:50%;" colspan="2">
                    <div style="font-size:11px;color:#9ca3af;margin-bottom:3px;">Invoice Number</div>
                    <div style="font-size:13px;font-weight:600;color:#111827;">${invoiceNumber}</div>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ ITEMS TABLE ═══════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:24px 36px 0;">
        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;margin-bottom:12px;">Items Ordered</div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
              <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </td>
    </tr>

    <!-- ═══ TOTALS ════════════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:16px 36px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Subtotal</td>
                  <td style="text-align:right;font-size:13px;color:#111827;font-weight:500;">${formatRs(subtotal)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Shipping</td>
                  <td style="text-align:right;font-size:13px;color:#16a34a;font-weight:600;">FREE</td>
                </tr>
              </table>
            </td>
          </tr>
          ${discPaise > 0 ? `
          <tr>
            <td style="padding:12px 20px;border-bottom:1px solid #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;">Discount ${couponCode ? `<span style="background:#fef3c7;color:#d97706;border-radius:4px;padding:1px 6px;font-size:11px;font-weight:700;">${couponCode}</span>` : ""}</td>
                  <td style="text-align:right;font-size:13px;color:#16a34a;font-weight:600;">- ${formatRs(discPaise)}</td>
                </tr>
              </table>
            </td>
          </tr>` : ""}
          <!-- Total Row -->
          <tr>
            <td style="padding:16px 20px;background:linear-gradient(135deg,${BRAND_ORANGE},${BRAND_DARK});">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#fff;font-size:15px;font-weight:700;letter-spacing:0.3px;">TOTAL AMOUNT</td>
                  <td style="text-align:right;color:#fff;font-size:18px;font-weight:800;">${formatRs(totalPaise)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ DELIVERY ADDRESS ══════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:24px 36px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr style="background:#f9fafb;">
            <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:10px;font-weight:700;letter-spacing:1px;color:#9ca3af;text-transform:uppercase;">📍 Delivery Address</span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px;">
              <div style="font-weight:700;color:#111827;font-size:14px;">${addr.fullName ?? ""}</div>
              <div style="color:#6b7280;font-size:13px;margin-top:4px;line-height:1.6;">
                ${addr.address ?? ""}<br>
                ${addr.city ?? ""}, ${addr.state ?? ""} - ${addr.pincode ?? ""}<br>
                📞 ${addr.phone ?? ""}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ CTA BUTTONS ═══════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:28px 36px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${invoiceUrl ? `
            <td style="padding-right:8px;">
              <a href="${invoiceUrl}" style="display:block;background:linear-gradient(135deg,${BRAND_ORANGE},${BRAND_DARK});color:#fff;text-decoration:none;text-align:center;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
                📄 Download Invoice
              </a>
            </td>
            <td style="padding-left:8px;">
              <a href="${trackUrl}" style="display:block;background:#f9fafb;border:2px solid #e5e7eb;color:#374151;text-decoration:none;text-align:center;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:700;">
                Track Order
              </a>
            </td>` : `
            <td>
              <a href="${trackUrl}" style="display:block;background:linear-gradient(135deg,${BRAND_ORANGE},${BRAND_DARK});color:#fff;text-decoration:none;text-align:center;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
                Track Your Order
              </a>
            </td>`}
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ DIVIDER ═══════════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:32px 36px 0;">
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
      </td>
    </tr>

    <!-- ═══ FOOTER ════════════════════════════════════════════════════════════ -->
    <tr>
      <td style="padding:24px 36px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <!-- Logo small -->
              <img src="${LOGO_URL()}" alt="Physiq" height="24" style="height:24px;max-width:100px;opacity:0.5;filter:invert(0.5);" />
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <!-- Social links -->
              <a href="https://instagram.com/physiq.lifestyle" style="color:${BRAND_ORANGE};text-decoration:none;font-size:12px;margin-left:12px;">Instagram</a>
              <a href="https://facebook.com/physiq" style="color:${BRAND_ORANGE};text-decoration:none;font-size:12px;margin-left:12px;">Facebook</a>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:12px;">
              <p style="color:#9ca3af;font-size:11px;line-height:1.6;margin:0;">
                You're receiving this email because you placed an order at Physiq.<br>
                Questions? Reply to this email or contact us at <a href="mailto:physiqlifestyle@gmail.com" style="color:${BRAND_ORANGE};text-decoration:none;">physiqlifestyle@gmail.com</a>
              </p>
              <p style="color:#d1d5db;font-size:10px;margin:8px 0 0;">
                © ${new Date().getFullYear()} Physiq — Premium Sports Health. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  <!-- end card -->

</td></tr>
</table>

</body>
</html>`;
}

// ─── Email via Resend ─────────────────────────────────────────────────────────

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  invoiceUrl?: string,
  invoiceNumber?: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    log("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "orders@healthspray.in";
  const body: Record<string, unknown> = {
    from: `Physiq <${fromEmail}>`,
    to: [to],
    subject,
    html,
  };

  // Attach invoice PDF
  if (invoiceUrl && invoiceNumber) {
    try {
      const pdfRes = await fetch(invoiceUrl);
      if (pdfRes.ok) {
        const pdfBuffer = await pdfRes.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
        body.attachments = [{ filename: `${invoiceNumber}.pdf`, content: base64 }];
      }
    } catch (e) {
      errLog("Failed to attach invoice PDF", e);
    }
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    errLog("Resend API error", err);
    return { success: false, error: err };
  }

  log("Email sent to", to);
  return { success: true };
}

// ─── SMS via MSG91 ────────────────────────────────────────────────────────────

async function sendSMS(
  mobile: string,
  orderId: string,
  amount: number,
  eventType: string
): Promise<{ success: boolean; error?: string }> {
  const authKey    = Deno.env.get("MSG91_AUTH_KEY");
  const templateId = Deno.env.get("MSG91_TEMPLATE_ID");
  const senderId   = Deno.env.get("MSG91_SENDER_ID") ?? "PHYSIQ";

  if (!authKey || !templateId) {
    log("MSG91 not configured, skipping SMS");
    return { success: false, error: "SMS not configured" };
  }

  const mob = mobile.startsWith("91") ? mobile : `91${mobile}`;
  const cfg = EVENT_CONFIG[eventType];

  const res = await fetch("https://api.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "authkey": authKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      template_id: templateId,
      sender: senderId,
      short_url: "0",
      recipients: [{
        mobiles: mob,
        order_id: orderId.slice(-8).toUpperCase(),
        amount: `Rs.${(amount / 100).toFixed(2)}`,
        status: cfg?.label ?? eventType,
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    errLog("MSG91 error", err);
    return { success: false, error: err };
  }

  log("SMS sent to", mob);
  return { success: true };
}

// ─── WhatsApp via Meta Cloud API ─────────────────────────────────────────────

async function sendWhatsApp(
  mobile: string,
  orderId: string,
  amount: number,
  eventType: string,
  customerName: string
): Promise<{ success: boolean; error?: string }> {
  const accessToken   = Deno.env.get("META_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("META_PHONE_NUMBER_ID");
  const templateName  = Deno.env.get("META_WA_TEMPLATE_NAME") ?? "order_status_update";
  const langCode      = Deno.env.get("META_WA_LANG_CODE") ?? "en_US";

  if (!accessToken || !phoneNumberId) {
    log("Meta Cloud API not configured, skipping WhatsApp");
    return { success: false, error: "WhatsApp not configured" };
  }

  const mob = mobile.startsWith("91") ? mobile : `91${mobile}`;
  const cfg = EVENT_CONFIG[eventType];

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: mob,
        type: "template",
        template: {
          name: templateName,
          language: { code: langCode },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: customerName },
              { type: "text", text: cfg?.label ?? eventType },
              { type: "text", text: `#${orderId.slice(-8).toUpperCase()}` },
              { type: "text", text: `Rs.${(amount / 100).toFixed(2)}` },
            ],
          }],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    errLog("Meta Cloud API error", err);
    return { success: false, error: err };
  }

  log("WhatsApp sent to", mob);
  return { success: true };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderId, eventType } = body;
    if (!orderId || !eventType) throw new Error("orderId and eventType are required");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: orderErr } = await supabaseService
      .from("orders").select("*").eq("id", orderId).single();

    if (orderErr || !order) throw new Error("Order not found");

    const addr         = (order.delivery_address ?? {}) as Record<string, string>;
    const customerName = addr.fullName ?? "Customer";
    const customerMobile = addr.phone ?? "";

    const addrEmail = addr.email ?? "";
    let userEmail = (order.guest_email as string) ?? addrEmail ?? "customer@example.com";
    if (order.user_id) {
      try {
        const { data: usr } = await supabaseService.auth.admin.getUserById(order.user_id);
        if (usr?.user?.email) userEmail = usr.user.email;
      } catch {}
    }

    const cfg = EVENT_CONFIG[eventType];
    const subject = `${cfg?.icon ?? ""} ${cfg?.label ?? "Order Update"} — #${orderId.slice(-8).toUpperCase()} | Physiq`;
    const html    = buildEmailHTML(order, eventType);
    const results: Record<string, unknown> = {};

    // ── Email
    const emailResult = await sendEmail(
      userEmail, subject, html,
      order.invoice_url ?? undefined,
      order.invoice_number ?? undefined
    );
    results.email = emailResult;
    await supabaseService.from("notification_logs").insert({
      order_id: orderId, notification_type: "email", event_type: eventType,
      recipient: userEmail,
      status: emailResult.success ? "sent" : "failed",
      error_message: emailResult.error ?? null,
      sent_at: emailResult.success ? new Date().toISOString() : null,
    }).catch(() => {});

    // ── SMS
    if (customerMobile) {
      const smsResult = await sendSMS(customerMobile, orderId, order.amount, eventType);
      results.sms = smsResult;
      await supabaseService.from("notification_logs").insert({
        order_id: orderId, notification_type: "sms", event_type: eventType,
        recipient: customerMobile,
        status: smsResult.success ? "sent" : "failed",
        error_message: smsResult.error ?? null,
        sent_at: smsResult.success ? new Date().toISOString() : null,
      }).catch(() => {});
    }

    // ── WhatsApp
    if (customerMobile) {
      const waResult = await sendWhatsApp(customerMobile, orderId, order.amount, eventType, customerName);
      results.whatsapp = waResult;
      await supabaseService.from("notification_logs").insert({
        order_id: orderId, notification_type: "whatsapp", event_type: eventType,
        recipient: customerMobile,
        status: waResult.success ? "sent" : "failed",
        error_message: waResult.error ?? null,
        sent_at: waResult.success ? new Date().toISOString() : null,
      }).catch(() => {});
    }

    log("Notifications dispatched", results);
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    errLog("Error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", success: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
