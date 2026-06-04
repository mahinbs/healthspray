import React from 'react';
import {
  getDeliveryTimestamp,
  getReturnDeadline,
  formatDateIN,
  type ReturnPolicySettings,
} from '@/lib/returnPolicy';

interface OrderDeliveryInfoProps {
  order: {
    status: string;
    created_at: string;
    delivered_at?: string | null;
    updated_at?: string;
  };
  returnPolicy?: ReturnPolicySettings;
  returnWindowDays?: number;
  className?: string;
}

export const OrderDeliveryInfo: React.FC<OrderDeliveryInfoProps> = ({
  order,
  returnPolicy,
  returnWindowDays,
  className = '',
}) => {
  const placedLabel = formatDateIN(order.created_at);
  const deliveredAt = getDeliveryTimestamp(order);
  const isDelivered = order.status === 'delivered';
  const windowDays = returnWindowDays ?? returnPolicy?.return_window_days ?? 7;
  const showReturnWindow =
    returnPolicy?.returns_enabled &&
    isDelivered &&
    deliveredAt &&
    order.status !== 'return_requested' &&
    order.status !== 'refunded';

  const returnDeadline =
    deliveredAt && showReturnWindow ? getReturnDeadline(deliveredAt, windowDays) : null;

  return (
    <div className={`space-y-3 text-sm ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground">Placed on</p>
          <p className="font-medium">{placedLabel}</p>
        </div>
        {isDelivered && deliveredAt && (
          <div>
            <p className="text-muted-foreground">Delivered on</p>
            <p className="font-medium text-green-700 dark:text-green-400">
              {formatDateIN(deliveredAt)}
            </p>
            {!order.delivered_at && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Based on last status update
              </p>
            )}
          </div>
        )}
      </div>

      {showReturnWindow && returnDeadline && (
        <div className="rounded-md bg-muted/50 border px-3 py-2 text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Return window: </span>
          Returns can be requested from delivery date until{' '}
          <strong className="text-foreground">{formatDateIN(returnDeadline)}</strong>
          {' '}({windowDays} days after delivery).
        </div>
      )}

      {isDelivered && !deliveredAt && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Delivery date is not recorded yet. Contact support if you need to return this order.
        </p>
      )}
    </div>
  );
};
