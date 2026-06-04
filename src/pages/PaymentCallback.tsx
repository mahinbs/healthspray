import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Download, ArrowRight, Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderPriceBreakdown } from '@/components/OrderPriceBreakdown';

interface OrderInfo {
  id: string;
  invoice_number?: string;
  invoice_url?: string;
  amount: number;
  status: string;
  delivery_address: Record<string, string>;
  coupon_code?: string;
  coupon_discount?: number;
  shipping_fee?: number;
  service_charge?: number;
  total_paid?: number;
  payment_mode?: string;
}

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderInfo | null>(null);

  const status   = searchParams.get('status');
  const orderId  = searchParams.get('orderId');
  const reason   = searchParams.get('reason');
  const emailParam = searchParams.get('email');
  const isSuccess = status === 'success';

  const trackEmail =
    emailParam ??
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('pending_order_email') : null) ??
    '';

  // Clear cart + session immediately on mount — don't block UI
  useEffect(() => {
    if (isSuccess) {
      clearCart();
      sessionStorage.removeItem('pending_order_id');
      sessionStorage.removeItem('pending_order_email');
    }
    // Fetch order details once in background — no blocking spinner
    if (orderId) fetchOrder(orderId);
  }, []);

  const fetchOrder = async (id: string) => {
    try {
      if (user) {
        const { data } = await supabase
          .from('orders')
          .select('id, amount, status, delivery_address, invoice_number, invoice_url, coupon_code, coupon_discount, shipping_fee, service_charge, total_paid, payment_mode')
          .eq('id', id)
          .single();
        if (data) setOrder(data as OrderInfo);
      } else if (trackEmail) {
        const { data } = await supabase.functions.invoke('track-order', {
          body: { orderId: id, email: trackEmail },
        });
        if (data?.success) setOrder(data.order as OrderInfo);
      }
    } catch { /* silent — order card just won't show */ }
  };

  const copyOrderId = () => {
    const id = order?.id ?? orderId;
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied');
  };

  const goToOrder = () => {
    if (!orderId) { navigate(user ? '/orders' : '/track-order'); return; }
    if (user) navigate(`/orders/${orderId}`);
    else {
      const p = new URLSearchParams({ orderId });
      if (trackEmail) p.set('email', trackEmail);
      navigate(`/track-order?${p}`);
    }
  };

  const shortRef = (order?.id ?? orderId)
    ? `#${(order?.id ?? orderId)!.substring(0, 8).toUpperCase()}`
    : '';

  // ── Success ────────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">

          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground mt-2">Your order has been placed and is being processed.</p>
          </div>

          {/* Order card — renders immediately, populates when fetched */}
          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order reference</span>
              <span className="font-mono font-medium">{shortRef || '—'}</span>
            </div>
            {(order?.id ?? orderId) && (
              <button type="button" onClick={copyOrderId}
                className="w-full flex items-center justify-center gap-2 text-xs font-mono text-primary hover:underline">
                <Copy className="h-3 w-3" />Copy full order ID for tracking
              </button>
            )}
            {order?.amount != null && (
              <div className="border-t pt-2 mt-2">
                <OrderPriceBreakdown order={order} status={order.status ?? 'paid'} compact />
              </div>
            )}
            {(order?.delivery_address as Record<string, string>)?.fullName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivering to</span>
                <span className="font-medium">{(order!.delivery_address as Record<string, string>).fullName}</span>
              </div>
            )}
          </div>

          {/* Invoice — show download if ready, else just a note (no spinner blocking) */}
          {order?.invoice_url ? (
            <Button variant="outline" onClick={() => window.open(order!.invoice_url!, '_blank')} className="w-full">
              <Download className="h-4 w-4 mr-2" />Download Invoice ({order.invoice_number})
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg py-2 px-3">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              Invoice will be emailed to you shortly
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Button onClick={goToOrder} className="w-full">
              {user ? 'View Order Details' : 'Track Order Status'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/shop')} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Failure ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground mt-2">
            {reason === 'hash_mismatch'
              ? 'Payment verification failed. Please contact support if amount was deducted.'
              : reason === 'order_not_found'
              ? 'We could not locate your order. Please contact support.'
              : 'Your payment could not be processed. No amount has been charged.'}
          </p>
        </div>
        {orderId && (
          <div className="bg-muted/50 rounded-xl p-4 text-sm">
            <span className="text-muted-foreground">Reference: </span>
            <span className="font-mono">#{orderId.substring(0, 8).toUpperCase()}</span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/cart')} className="w-full">Return to Cart & Retry</Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">Go to Home</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          If you were charged and the order failed, email us at{' '}
          <a href="mailto:support@healthspray.in" className="underline text-primary">support@healthspray.in</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentCallback;
