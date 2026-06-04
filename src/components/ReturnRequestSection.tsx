import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RotateCcw, Loader2 } from 'lucide-react';
import {
  canCustomerRequestReturn,
  getDeliveryTimestamp,
  isWithinReturnWindow,
  DEFAULT_RETURN_POLICY,
  type ReturnPolicySettings,
} from '@/lib/returnPolicy';

interface ReturnRequestSectionProps {
  order: {
    id: string;
    status: string;
    delivered_at?: string | null;
    updated_at?: string;
    return_reason?: string | null;
    return_requested_at?: string | null;
    items?: Array<{ product?: { id?: string; name?: string } }>;
  };
  /** Required for guest checkout verification */
  email: string;
  returnPolicy?: ReturnPolicySettings;
  productWindowDays?: number;
  onSuccess?: () => void;
}

export const ReturnRequestSection: React.FC<ReturnRequestSectionProps> = ({
  order,
  email,
  returnPolicy = DEFAULT_RETURN_POLICY,
  productWindowDays,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const windowDays =
    productWindowDays != null
      ? Math.min(returnPolicy.return_window_days, productWindowDays)
      : returnPolicy.return_window_days;

  if (!returnPolicy.returns_enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Returns are not available. Contact support if you received a damaged or wrong item.
      </p>
    );
  }

  if (order.status === 'return_requested') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-200">Return requested</p>
        {order.return_requested_at && (
          <p className="text-muted-foreground mt-1">
            Submitted {new Date(order.return_requested_at).toLocaleString('en-IN')}
          </p>
        )}
        {order.return_reason && (
          <p className="mt-2 text-muted-foreground">{order.return_reason}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          We will review and process your refund after the item is received.
        </p>
      </div>
    );
  }

  if (order.status === 'refunded') {
    return (
      <p className="text-sm text-muted-foreground">This order has been refunded.</p>
    );
  }

  if (!canCustomerRequestReturn(order)) {
    return (
      <p className="text-sm text-muted-foreground">
        You can request a return only after your order status is <strong>Delivered</strong>.
        Current status: <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>.
      </p>
    );
  }

  const deliveredAt = getDeliveryTimestamp(order);
  if (!deliveredAt) {
    return (
      <p className="text-sm text-muted-foreground">
        Delivery date is not recorded yet. Please try again after delivery is confirmed.
      </p>
    );
  }

  if (!isWithinReturnWindow(deliveredAt, windowDays)) {
    return (
      <p className="text-sm text-muted-foreground">
        The return window ({windowDays} days from delivery) has ended for this order.
      </p>
    );
  }

  const daysLeft = Math.max(0, windowDays - Math.floor((Date.now() - deliveredAt.getTime()) / 86400000));

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Email is required to verify your order');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('request-order-return', {
        body: { orderId: order.id, email: email.trim(), reason: reason.trim() },
      });
      if (error) {
        let msg = error.message;
        try {
          const ctx = (error as { context?: Response })?.context;
          if (ctx) {
            const parsed = await ctx.json();
            if (parsed?.error) msg = parsed.error;
          }
        } catch {
          /* ignore */
        }
        toast.error(msg);
        return;
      }
      if (!data?.success) {
        toast.error(data?.error ?? 'Could not submit return request');
        return;
      }
      toast.success(data.message ?? 'Return request submitted');
      setReason('');
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">Request return / refund</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Available for delivered orders only. {daysLeft} day(s) left in your {windowDays}-day return window.
        Refund is processed after admin approval (not automatic).
      </p>
      <div>
        <Label htmlFor="return-reason" className="text-xs">Reason (optional)</Label>
        <Textarea
          id="return-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Wrong item, damaged product, etc."
          rows={3}
          className="mt-1"
        />
      </div>
      <Button onClick={handleSubmit} disabled={submitting} className="w-full" variant="outline">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4 mr-2" />
            Request return
          </>
        )}
      </Button>
    </div>
  );
};
