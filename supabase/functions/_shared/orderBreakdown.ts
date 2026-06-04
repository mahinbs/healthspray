/** Shared order amount breakdown (amount in paise; fees/discounts in rupees). */

export function formatPaymentModeLabel(mode: string, subInstType?: string): string {
  const m = (mode ?? "").toUpperCase();
  const sub = (subInstType ?? "").toUpperCase();
  if (m === "UPI") return "UPI";
  if (m === "NB") return "Net Banking";
  if (m === "CARD") {
    if (sub.includes("DC")) return "Debit Card";
    if (sub.includes("CC")) return "Credit Card";
    return "Card";
  }
  return mode || "Online Payment";
}

/** ICICI gateway convenience fee (rupees). Update rates for production. */
export function calculateServiceCharge(
  merchantAmountRupees: number,
  paymentMode: string,
  subInstType: string
): number {
  const mode = (paymentMode ?? "").toUpperCase();
  const sub = (subInstType ?? "").toUpperCase();
  if (merchantAmountRupees <= 0) return 0;
  if (mode === "UPI") return 0;
  if (mode === "CARD") {
    const rate = sub.includes("DC") ? 0.018 : 0.0275;
    return Math.round(merchantAmountRupees * rate * 100) / 100;
  }
  if (mode === "NB") {
    return Math.round(merchantAmountRupees * 0.025 * 100) / 100;
  }
  return 0;
}

export interface OrderBreakdown {
  productsSubtotalRupees: number;
  discountRupees: number;
  shippingRupees: number;
  merchantTotalRupees: number;
  serviceChargeRupees: number;
  customerPaidRupees: number;
  paymentModeLabel: string;
}

export function parseOrderBreakdown(order: Record<string, unknown>): OrderBreakdown {
  const merchantPaise = Number(order.amount ?? 0);
  const discountRupees = Number(order.coupon_discount ?? 0);
  const shippingRupees = Number(order.shipping_fee ?? 0);
  const merchantTotalRupees = merchantPaise / 100;
  const productsSubtotalRupees = Math.max(
    0,
    merchantTotalRupees + discountRupees - shippingRupees
  );
  const serviceChargeRupees = Number(order.service_charge ?? 0);
  const customerPaidRupees =
    Number(order.total_paid ?? 0) > 0
      ? Number(order.total_paid)
      : merchantTotalRupees + serviceChargeRupees;
  const paymentModeLabel = formatPaymentModeLabel(
    String(order.payment_mode ?? ""),
    String(order.payment_sub_inst_type ?? "")
  );

  return {
    productsSubtotalRupees,
    discountRupees,
    shippingRupees,
    merchantTotalRupees,
    serviceChargeRupees,
    customerPaidRupees,
    paymentModeLabel,
  };
}

export function formatRs(amountRupees: number): string {
  return `₹${amountRupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
