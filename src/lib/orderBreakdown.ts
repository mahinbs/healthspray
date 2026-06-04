/** Order amount breakdown — keep in sync with supabase/functions/_shared/orderBreakdown.ts */

export function formatPaymentModeLabel(mode?: string | null, subInstType?: string | null): string {
  const m = (mode ?? '').toUpperCase();
  const sub = (subInstType ?? '').toUpperCase();
  if (m === 'UPI') return 'UPI';
  if (m === 'NB') return 'Net Banking';
  if (m === 'CARD') {
    if (sub.includes('DC')) return 'Debit Card';
    if (sub.includes('CC')) return 'Credit Card';
    return 'Card';
  }
  return mode || 'Online Payment';
}

export interface OrderBreakdownFields {
  amount: number;
  coupon_code?: string | null;
  coupon_discount?: number | null;
  shipping_fee?: number | null;
  service_charge?: number | null;
  total_paid?: number | null;
  payment_mode?: string | null;
  payment_sub_inst_type?: string | null;
}

export interface OrderBreakdown {
  productsSubtotalRupees: number;
  discountRupees: number;
  shippingRupees: number;
  merchantTotalRupees: number;
  serviceChargeRupees: number;
  customerPaidRupees: number;
  paymentModeLabel: string;
  hasServiceCharge: boolean;
}

export function getOrderBreakdown(order: OrderBreakdownFields): OrderBreakdown {
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
    order.payment_mode,
    order.payment_sub_inst_type
  );

  return {
    productsSubtotalRupees,
    discountRupees,
    shippingRupees,
    merchantTotalRupees,
    serviceChargeRupees,
    customerPaidRupees,
    paymentModeLabel,
    hasServiceCharge: serviceChargeRupees > 0,
  };
}

export function formatRs(amountRupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amountRupees);
}
