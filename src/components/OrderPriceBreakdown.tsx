import React from 'react';
import { getOrderBreakdown, formatRs, type OrderBreakdownFields } from '@/lib/orderBreakdown';

interface OrderPriceBreakdownProps {
  order: OrderBreakdownFields;
  status?: string;
  /** Show admin labels (merchant vs gateway) */
  admin?: boolean;
  compact?: boolean;
  className?: string;
}

export const OrderPriceBreakdown: React.FC<OrderPriceBreakdownProps> = ({
  order,
  status,
  admin = false,
  compact = false,
  className = '',
}) => {
  const b = getOrderBreakdown(order);
  const rowClass = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={`space-y-2 ${rowClass} ${className}`}>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Products subtotal</span>
        <span>{formatRs(b.productsSubtotalRupees)}</span>
      </div>
      {b.discountRupees > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
          <span>- {formatRs(b.discountRupees)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Delivery</span>
        <span className={b.shippingRupees === 0 ? 'text-green-600' : ''}>
          {b.shippingRupees === 0 ? 'Free' : formatRs(b.shippingRupees)}
        </span>
      </div>
      <div className="flex justify-between font-medium border-t pt-2">
        <span>{admin ? 'Merchant / platform total' : 'Order total'}</span>
        <span>{formatRs(b.merchantTotalRupees)}</span>
      </div>
      {b.hasServiceCharge && (
        <>
          <div className="flex justify-between text-muted-foreground">
            <span>
              Gateway fee ({b.paymentModeLabel})
              {admin && <span className="block text-[10px]">Paid to ICICI</span>}
            </span>
            <span>{formatRs(b.serviceChargeRupees)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary border-t pt-2">
            <span>{admin ? 'Customer paid (incl. gateway)' : 'Total paid'}</span>
            <span>{formatRs(b.customerPaidRupees)}</span>
          </div>
        </>
      )}
      {!b.hasServiceCharge && status === 'paid' && (
        <p className="text-[10px] text-muted-foreground">
          Gateway fee applies after payment (Card / Net Banking). Shown on invoice once confirmed.
        </p>
      )}
      {admin && b.hasServiceCharge && (
        <div className="mt-2 p-2 rounded-md bg-muted/50 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span>To merchant (Physiq)</span>
            <span className="font-medium">{formatRs(b.merchantTotalRupees)}</span>
          </div>
          <div className="flex justify-between">
            <span>To payment gateway (ICICI)</span>
            <span className="font-medium">{formatRs(b.serviceChargeRupees)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
