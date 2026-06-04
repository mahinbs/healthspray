export const DEFAULT_RETURN_WINDOW_DAYS = 7;

export interface ReturnPolicySettings {
  returns_enabled: boolean;
  return_window_days: number;
}

export const DEFAULT_RETURN_POLICY: ReturnPolicySettings = {
  returns_enabled: true,
  return_window_days: DEFAULT_RETURN_WINDOW_DAYS,
};

/** Customers may only request a return after delivery. */
export const CUSTOMER_RETURN_ELIGIBLE_STATUS = 'delivered' as const;

export function getDeliveryTimestamp(order: {
  delivered_at?: string | null;
  updated_at?: string;
  status?: string;
}): Date | null {
  if (order.delivered_at) return new Date(order.delivered_at);
  if (order.status === 'delivered' && order.updated_at) return new Date(order.updated_at);
  return null;
}

export function daysSinceDelivery(deliveredAt: Date): number {
  const ms = Date.now() - deliveredAt.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isWithinReturnWindow(
  deliveredAt: Date,
  windowDays: number
): boolean {
  if (windowDays <= 0) return false;
  return daysSinceDelivery(deliveredAt) <= windowDays;
}

export function canCustomerRequestReturn(order: {
  status: string;
  delivered_at?: string | null;
  updated_at?: string;
}): boolean {
  if (order.status === 'return_requested' || order.status === 'refunded') return false;
  return order.status === CUSTOMER_RETURN_ELIGIBLE_STATUS;
}

export function formatDateIN(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Last calendar day (end of day) when a return can still be requested. */
export function getReturnDeadline(deliveredAt: Date, windowDays: number): Date {
  const end = new Date(deliveredAt.getTime());
  end.setDate(end.getDate() + windowDays);
  end.setHours(23, 59, 59, 999);
  return end;
}
