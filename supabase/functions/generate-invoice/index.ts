import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb, StandardFonts, degrees } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, data?: unknown) => console.log(`[generate-invoice] ${msg}`, data ?? "");
const errLog = (msg: string, data?: unknown) => console.error(`[generate-invoice] ${msg}`, data ?? "");

// Brand colors
const BRAND_ORANGE    = rgb(0.937, 0.306, 0.137);  // #EF4E23
const BRAND_DARK      = rgb(0.957, 0.325, 0.165);  // slightly lighter for gradient effect
const WHITE           = rgb(1, 1, 1);
const NEAR_BLACK      = rgb(0.1, 0.1, 0.12);
const GRAY_600        = rgb(0.4, 0.42, 0.45);
const GRAY_100        = rgb(0.96, 0.96, 0.97);
const GRAY_200        = rgb(0.9, 0.9, 0.92);
const GREEN           = rgb(0.16, 0.65, 0.27);
const LIGHT_ORANGE    = rgb(1.0, 0.94, 0.91);      // tint for highlight rows

function formatRupees(paise: number): string {
  return `Rs. ${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.substring(0, len - 1) + "…" : str;
}

async function buildInvoicePDF(order: Record<string, unknown>, invoiceNumber: string, appUrl: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // A4 page
  const page = pdfDoc.addPage([595.28, 841.89]);
  const W = 595.28;
  const H = 841.89;

  // ─── Attempt to embed logo ──────────────────────────────────────────────────
  let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
  try {
    const logoRes = await fetch(`${appUrl}/logo-white.png`);
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer();
      logoImage = await pdfDoc.embedPng(new Uint8Array(logoBytes));
    }
  } catch {
    errLog("Could not load logo, skipping");
  }

  // ─── Header background (orange) ────────────────────────────────────────────
  const headerH = 110;
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: BRAND_ORANGE });

  // Decorative circles in header
  page.drawCircle({ x: W - 40, y: H - 10, size: 90, color: BRAND_DARK, opacity: 0.35 });
  page.drawCircle({ x: W - 80, y: H - headerH + 5, size: 55, color: BRAND_DARK, opacity: 0.25 });
  page.drawCircle({ x: 10, y: H - headerH + 20, size: 40, color: BRAND_DARK, opacity: 0.18 });

  // Logo or text fallback
  if (logoImage) {
    const dims = logoImage.scaleToFit(170, 42);
    page.drawImage(logoImage, {
      x: 36,
      y: H - headerH / 2 - dims.height / 2,
      width: dims.width,
      height: dims.height,
    });
  } else {
    page.drawText("PHYSIQ", { x: 36, y: H - 52, font: fontBold, size: 28, color: WHITE });
    page.drawText("Sports Health Products", { x: 36, y: H - 70, font: fontReg, size: 10, color: rgb(1, 0.85, 0.78) });
  }

  // "INVOICE" label on right
  page.drawText("INVOICE", { x: W - 155, y: H - 48, font: fontBold, size: 26, color: WHITE });
  page.drawText(invoiceNumber, { x: W - 155, y: H - 66, font: fontReg, size: 10, color: rgb(1, 0.88, 0.82) });

  // ─── Orange accent strip below header ──────────────────────────────────────
  page.drawRectangle({ x: 0, y: H - headerH - 4, width: W, height: 4, color: BRAND_DARK });

  // ─── Meta info row (date, order id, status) ─────────────────────────────────
  const metaY = H - headerH - 28;
  page.drawText(`Date: ${formatDate(order.created_at as string)}`, {
    x: 36, y: metaY, font: fontReg, size: 9, color: GRAY_600,
  });
  page.drawText(`Order: #${(order.id as string).slice(-8).toUpperCase()}`, {
    x: 220, y: metaY, font: fontReg, size: 9, color: GRAY_600,
  });
  if (order.payment_mode) {
    page.drawText(`Payment: ${order.payment_mode}`, {
      x: 380, y: metaY, font: fontReg, size: 9, color: GRAY_600,
    });
  }
  // Paid badge
  const badgeX = W - 80;
  page.drawRectangle({ x: badgeX - 4, y: metaY - 4, width: 52, height: 16, color: GREEN, borderRadius: 4 });
  page.drawText("PAID", { x: badgeX + 8, y: metaY + 1, font: fontBold, size: 9, color: WHITE });

  // Thin divider
  page.drawRectangle({ x: 36, y: metaY - 12, width: W - 72, height: 0.5, color: GRAY_200 });

  // ─── Two-column section: Bill To + Invoice Details ───────────────────────────
  const addr = (order.delivery_address ?? {}) as Record<string, string>;
  const colLeft = 36;
  const colRight = W / 2 + 10;
  let leftY = H - headerH - 55;
  let rightY = leftY;

  // Bill To
  page.drawText("BILL TO", { x: colLeft, y: leftY, font: fontBold, size: 8, color: BRAND_ORANGE });
  leftY -= 14;
  page.drawText(addr.fullName ?? "Customer", { x: colLeft, y: leftY, font: fontBold, size: 12, color: NEAR_BLACK });
  leftY -= 13;

  const addrLines = [
    addr.address ?? "",
    `${addr.city ?? ""}, ${addr.state ?? ""} - ${addr.pincode ?? ""}`,
    `Phone: ${addr.phone ?? ""}`,
  ].filter(Boolean);
  for (const line of addrLines) {
    page.drawText(truncate(line, 48), { x: colLeft, y: leftY, font: fontReg, size: 9.5, color: GRAY_600 });
    leftY -= 13;
  }

  // Invoice Details table (right side)
  const drawDetail = (label: string, value: string, bold = false) => {
    page.drawText(label, { x: colRight, y: rightY, font: fontReg, size: 9, color: GRAY_600 });
    page.drawText(value, {
      x: colRight + 95, y: rightY,
      font: bold ? fontBold : fontReg, size: 9, color: NEAR_BLACK,
    });
    rightY -= 14;
  };

  drawDetail("Invoice No.:", invoiceNumber, true);
  drawDetail("Invoice Date:", formatDate(order.created_at as string));
  drawDetail("Order ID:", `#${(order.id as string).slice(-8).toUpperCase()}`);
  if (order.payment_mode) drawDetail("Payment Mode:", order.payment_mode as string);
  if (order.icici_txn_id) drawDetail("Transaction ID:", truncate(order.icici_txn_id as string, 22));

  // ─── Items Table ─────────────────────────────────────────────────────────────
  const tableTop = Math.min(leftY, rightY) - 20;
  const tableLeft = 36;
  const tableWidth = W - 72;
  const rowHeight = 28;

  // Column widths
  const colWidths = { no: 24, item: 200, qty: 48, price: 80, total: 80 };
  const colX = {
    no: tableLeft,
    item: tableLeft + colWidths.no,
    qty: tableLeft + colWidths.no + colWidths.item,
    price: tableLeft + colWidths.no + colWidths.item + colWidths.qty,
    total: tableLeft + colWidths.no + colWidths.item + colWidths.qty + colWidths.price,
  };

  // Table header
  page.drawRectangle({ x: tableLeft, y: tableTop - rowHeight, width: tableWidth, height: rowHeight, color: NEAR_BLACK });
  const thY = tableTop - rowHeight + 9;
  page.drawText("#",          { x: colX.no + 6,    y: thY, font: fontBold, size: 9, color: WHITE });
  page.drawText("ITEM",      { x: colX.item + 8,   y: thY, font: fontBold, size: 9, color: WHITE });
  page.drawText("QTY",       { x: colX.qty + 4,    y: thY, font: fontBold, size: 9, color: WHITE });
  page.drawText("UNIT PRICE",{ x: colX.price + 2,  y: thY, font: fontBold, size: 9, color: WHITE });
  page.drawText("TOTAL",     { x: colX.total + 8,  y: thY, font: fontBold, size: 9, color: WHITE });

  // Items
  const items = (order.items as Array<{ product: { name: string; price: number; category?: string }; quantity: number }>) ?? [];
  let rowY = tableTop - rowHeight;
  let lineTotal = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    rowY -= rowHeight;
    const itemTotal = (item.product?.price ?? 0) * (item.quantity ?? 1);
    lineTotal += itemTotal;

    // Row background
    if (i % 2 === 0) {
      page.drawRectangle({ x: tableLeft, y: rowY, width: tableWidth, height: rowHeight, color: GRAY_100 });
    }

    const ry = rowY + 9;
    page.drawText(String(i + 1),          { x: colX.no + 8,    y: ry, font: fontReg, size: 9, color: GRAY_600 });
    page.drawText(truncate(item.product?.name ?? "Product", 34),
                                           { x: colX.item + 8,   y: ry + 4, font: fontBold, size: 9.5, color: NEAR_BLACK });
    if (item.product?.category) {
      page.drawText(truncate(item.product.category, 30), { x: colX.item + 8, y: ry - 6, font: fontOblique, size: 7.5, color: GRAY_600 });
    }
    page.drawText(String(item.quantity ?? 1),  { x: colX.qty + 8,   y: ry, font: fontReg, size: 9, color: NEAR_BLACK });
    page.drawText(`Rs.${(item.product?.price ?? 0).toLocaleString("en-IN")}`,
                                           { x: colX.price + 2,  y: ry, font: fontReg, size: 9, color: NEAR_BLACK });
    page.drawText(`Rs.${itemTotal.toLocaleString("en-IN")}`,
                                           { x: colX.total + 2,  y: ry, font: fontBold, size: 9.5, color: NEAR_BLACK });

    // Row border bottom
    page.drawRectangle({ x: tableLeft, y: rowY, width: tableWidth, height: 0.5, color: GRAY_200 });
  }

  // ─── Totals Section ──────────────────────────────────────────────────────────
  const totalsStartY = rowY - 16;
  const totalsX = colX.price - 10;
  const totalsValX = colX.total;
  let ty = totalsStartY;

  const drawTotalRow = (label: string, value: string, bold = false, color = NEAR_BLACK, bgColor?: typeof BRAND_ORANGE) => {
    if (bgColor) {
      page.drawRectangle({ x: totalsX - 8, y: ty - 5, width: W - totalsX + 8 - 36, height: 20, color: bgColor });
    }
    page.drawText(label, { x: totalsX, y: ty, font: bold ? fontBold : fontReg, size: 9.5, color: bold ? color : GRAY_600 });
    page.drawText(value, { x: totalsValX + 2, y: ty, font: bold ? fontBold : fontReg, size: 9.5, color });
    ty -= 20;
  };

  const subtotalPaise = (order.amount as number) + ((order.coupon_discount as number) ?? 0);
  const discount = (order.coupon_discount as number) ?? 0;
  const total = order.amount as number;

  drawTotalRow("Subtotal", formatRupees(subtotalPaise));
  drawTotalRow("Shipping", "FREE", false, GREEN);
  if (discount > 0) {
    drawTotalRow(`Discount (${order.coupon_code ?? ""})`, `- ${formatRupees(discount)}`, false, GREEN);
  }

  ty -= 4;
  // Grand total highlight
  page.drawRectangle({ x: totalsX - 8, y: ty - 8, width: W - totalsX + 8 - 36, height: 26, color: BRAND_ORANGE });
  page.drawText("GRAND TOTAL", { x: totalsX, y: ty, font: fontBold, size: 11, color: WHITE });
  page.drawText(formatRupees(total), { x: totalsValX - 10, y: ty, font: fontBold, size: 12, color: WHITE });

  // ─── Notes Box ───────────────────────────────────────────────────────────────
  const notesY = ty - 40;
  page.drawRectangle({ x: 36, y: notesY - 40, width: 240, height: 56, color: LIGHT_ORANGE, borderRadius: 4 });
  page.drawText("NOTES", { x: 48, y: notesY + 2, font: fontBold, size: 8, color: BRAND_ORANGE });
  page.drawText("• Thank you for shopping with Physiq!", { x: 48, y: notesY - 12, font: fontReg, size: 8.5, color: GRAY_600 });
  page.drawText("• All sales are subject to our return policy.", { x: 48, y: notesY - 24, font: fontReg, size: 8.5, color: GRAY_600 });
  page.drawText("• Contact us for any queries.", { x: 48, y: notesY - 36, font: fontReg, size: 8.5, color: GRAY_600 });

  // ─── Footer ──────────────────────────────────────────────────────────────────
  const footerY = 54;
  page.drawRectangle({ x: 0, y: 0, width: W, height: footerY, color: NEAR_BLACK });

  // Divider line
  page.drawRectangle({ x: 0, y: footerY, width: W, height: 2, color: BRAND_ORANGE });

  page.drawText("Physiq — Premium Sports Health", {
    x: 36, y: footerY - 18, font: fontBold, size: 9, color: WHITE,
  });
  page.drawText("physiqlifestyle@gmail.com  |  instagram.com/physiq.lifestyle", {
    x: 36, y: footerY - 32, font: fontReg, size: 8, color: rgb(0.6, 0.62, 0.65),
  });

  page.drawText("This is a computer-generated invoice and does not require a physical signature.", {
    x: W - 36 - 280, y: footerY - 18, font: fontOblique, size: 7.5, color: rgb(0.5, 0.52, 0.55),
  });
  page.drawText(`Generated on ${new Date().toLocaleDateString("en-IN")}`, {
    x: W - 36 - 150, y: footerY - 32, font: fontReg, size: 7.5, color: rgb(0.5, 0.52, 0.55),
  });

  // Page border accent
  page.drawRectangle({ x: 0, y: 0, width: 4, height: H, color: BRAND_ORANGE });

  return await pdfDoc.save();
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderId } = body;
    if (!orderId) throw new Error("orderId is required");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: orderErr } = await supabaseService
      .from("orders").select("*").eq("id", orderId).single();

    if (orderErr || !order) throw new Error("Order not found");

    // Idempotent: return existing
    if (order.invoice_url) {
      log("Invoice already exists", order.invoice_url);
      return new Response(JSON.stringify({
        success: true,
        invoiceNumber: order.invoice_number,
        invoiceUrl: order.invoice_url,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate invoice number using DB sequence
    const { data: seqData } = await supabaseService
      .rpc("nextval", { seq: "invoice_number_seq" })
      .maybeSingle()
      .catch(() => ({ data: null }));

    const seqNum = seqData ?? (Date.now() % 900000) + 1000;
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(seqNum).padStart(6, "0")}`;
    const appUrl = Deno.env.get("APP_URL") ?? "";

    log("Generating PDF", { orderId, invoiceNumber });

    const pdfBytes = await buildInvoicePDF(order, invoiceNumber, appUrl);

    const fileName = `${invoiceNumber}.pdf`;
    const { error: uploadErr } = await supabaseService.storage
      .from("invoices")
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadErr) {
      errLog("Storage upload error", uploadErr);
      throw new Error("Failed to store invoice");
    }

    const { data: urlData } = supabaseService.storage
      .from("invoices").getPublicUrl(fileName);

    const invoiceUrl = urlData.publicUrl;
    log("Invoice stored", invoiceUrl);

    await supabaseService.from("orders").update({
      invoice_number: invoiceNumber,
      invoice_url: invoiceUrl,
      invoice_generated_at: new Date().toISOString(),
    }).eq("id", orderId);

    return new Response(
      JSON.stringify({ success: true, invoiceNumber, invoiceUrl }),
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
