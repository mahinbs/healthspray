export interface StoreShippingSettings {
  free_shipping_minimum: number;
  delivery_charge: number;
}

export const DEFAULT_SHIPPING_SETTINGS: StoreShippingSettings = {
  free_shipping_minimum: 500,
  delivery_charge: 49,
};

export function computeShippingFee(
  subtotalAfterDiscount: number,
  settings: StoreShippingSettings
): number {
  if (subtotalAfterDiscount <= 0) return 0;
  if (subtotalAfterDiscount >= settings.free_shipping_minimum) return 0;
  return settings.delivery_charge;
}

export function computeGrandTotal(
  subtotal: number,
  discountAmount: number,
  settings: StoreShippingSettings
): {
  subtotalAfterDiscount: number;
  shippingFee: number;
  grandTotal: number;
  isFreeShipping: boolean;
} {
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shippingFee = computeShippingFee(subtotalAfterDiscount, settings);
  return {
    subtotalAfterDiscount,
    shippingFee,
    grandTotal: subtotalAfterDiscount + shippingFee,
    isFreeShipping: shippingFee === 0 && subtotalAfterDiscount > 0,
  };
}
