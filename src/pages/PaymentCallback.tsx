import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Download, ArrowRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderInfo {
  id: string;
  invoice_number?: string;
  invoice_url?: string;
  amount: number;
  status: string;
  delivery_address: Record<string, string>;
}

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceReady, setInvoiceReady] = useState(false);

  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');
  const emailParam = searchParams.get('email');
  const isSuccess = status === 'success';

  const trackEmail =
    emailParam ??
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('pending_order_email') : null) ??
    '';

  const trackOrderPath = (id: string, email: string) => {
    const params = new URLSearchParams({ orderId: id });
    if (email) params.set('email', email);
    return `/track-order?${params.toString()}`;
  };

  useEffect(() => {
    if (isSuccess) {
      clearCart();
      sessionStorage.removeItem('pending_order_id');
      sessionStorage.removeItem('pending_order_email');
    }

    if (orderId && trackEmail) {
      fetchOrderWithPolling(orderId, trackEmail);
    } else if (orderId && user) {
      fetchOrderAsUser(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId, isSuccess, trackEmail, user]);

  const fetchOrderWithPolling = async (id: string, email: string, attempts = 0) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-order', {
        body: { orderId: id, email },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error);

      const o = data.order as OrderInfo;
      setOrder(o);

      if (isSuccess && !o.invoice_url && attempts < 10) {
        setTimeout(() => fetchOrderWithPolling(id, email, attempts + 1), 2000);
      } else {
        if (o.invoice_url) setInvoiceReady(true);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const fetchOrderAsUser = async (id: string, attempts = 0) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, amount, status, delivery_address, invoice_number, invoice_url')
        .eq('id', id)
        .single();

      if (error) throw error;

      setOrder(data as OrderInfo);

      if (isSuccess && !data.invoice_url && attempts < 10) {
        setTimeout(() => fetchOrderAsUser(id, attempts + 1), 2000);
      } else {
        if (data.invoice_url) setInvoiceReady(true);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    const id = order?.id ?? orderId;
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied');
  };

  const goToOrderDetails = () => {
    if (!orderId) {
      navigate(user ? '/orders' : '/track-order');
      return;
    }
    if (user) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate(trackOrderPath(orderId, trackEmail));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium">Processing your payment...</p>
          <p className="text-sm text-muted-foreground">Please wait, this may take a moment.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    const shortRef = order?.id
      ? `#${order.id.substring(0, 8).toUpperCase()}`
      : orderId
        ? `#${orderId.substring(0, 8).toUpperCase()}`
        : '';

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground mt-2">
              Your order has been placed and is being processed.
            </p>
          </div>

          {(order || orderId) && (
            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order reference</span>
                <span className="font-mono font-medium">{shortRef}</span>
              </div>
              {(order?.id ?? orderId) && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={copyOrderId}
                    className="w-full flex items-center justify-center gap-2 text-xs font-mono text-primary hover:underline"
                  >
                    <Copy className="h-3 w-3" />
                    Copy full order ID for tracking
                  </button>
                </div>
              )}
              {order?.invoice_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice No</span>
                  <span className="font-medium">{order.invoice_number}</span>
                </div>
              )}
              {order && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-green-600">₹{(order.amount / 100).toFixed(2)}</span>
                </div>
              )}
              {(order?.delivery_address as Record<string, string>)?.fullName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivering to</span>
                  <span className="font-medium">{(order.delivery_address as Record<string, string>).fullName}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {trackEmail
              ? `Save your order ID — we sent a confirmation to ${trackEmail}. You can track status anytime at Track Order (no account needed).`
              : 'A confirmation email has been sent. Use Track Order with your order ID and checkout email.'}
          </p>

          <div className="flex flex-col gap-3">
            {(invoiceReady || order?.invoice_url) && (
              <Button
                variant="outline"
                onClick={() => window.open(order!.invoice_url!, '_blank')}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            )}

            {!invoiceReady && !order?.invoice_url && isSuccess && order && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating invoice...
              </p>
            )}

            <Button onClick={goToOrderDetails} className="w-full">
              {user ? 'View Order Details' : 'Track Order Status'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {!user && orderId && (
              <Button
                variant="outline"
                onClick={() => navigate(trackOrderPath(orderId, trackEmail))}
                className="w-full"
              >
                Track order later
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => navigate('/shop')}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Failure state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
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
          <Button onClick={() => navigate('/cart')} className="w-full">
            Return to Cart & Retry
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If you were charged and the order failed, please email us at{' '}
          <a href="mailto:support@healthspray.in" className="underline text-primary">
            support@healthspray.in
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentCallback;
