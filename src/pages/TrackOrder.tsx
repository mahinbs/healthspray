import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/services/api';
import { OrderPriceBreakdown } from '@/components/OrderPriceBreakdown';
import { getOrderBreakdown, formatRs } from '@/lib/orderBreakdown';
import { formatOrderReference } from '@/lib/orderReference';
import { ReturnRequestSection } from '@/components/ReturnRequestSection';
import { OrderDeliveryInfo } from '@/components/OrderDeliveryInfo';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Loader2, Package, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

interface TrackedOrder {
  id: string;
  amount: number;
  status: string;
  items: Array<{ product: { name: string; price: number; image?: string }; quantity: number }>;
  delivery_address: Record<string, string>;
  created_at: string;
  updated_at: string;
  invoice_number?: string;
  invoice_url?: string;
  coupon_code?: string;
  coupon_discount?: number;
  shipping_fee?: number;
  service_charge?: number;
  total_paid?: number;
  payment_mode?: string;
  payment_sub_inst_type?: string;
  delivered_at?: string | null;
  return_reason?: string | null;
  return_requested_at?: string | null;
}

const statusLabel: Record<string, string> = {
  pending: 'Payment pending',
  paid: 'Confirmed',
  failed: 'Payment failed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  refunded: 'Refunded',
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') ?? '');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const { settings: storeSettings } = useStoreSettings();

  const lookup = async (id: string, em: string) => {
    if (!id.trim() || !em.trim()) {
      toast.error('Enter your order ID and the email used at checkout');
      return;
    }
    setLoading(true);
    setOrder(null);
    try {
      const { data, error } = await supabase.functions.invoke('track-order', {
        body: { orderId: id.trim(), email: em.trim() },
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
        toast.error(msg || 'Could not look up order');
        return;
      }
      if (!data?.success) {
        toast.error(data?.error ?? 'Order not found');
        return;
      }
      setOrder(data.order as TrackedOrder);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not look up order. Try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qId = searchParams.get('orderId');
    const qEmail = searchParams.get('email');
    if (qId && qEmail) {
      lookup(qId, qEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(orderId, email);
  };

  const displayRef = order ? `#${formatOrderReference(order.id)}` : '';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <Package className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Track your order</h1>
          <p className="text-muted-foreground mt-2">
            Use the 8-character order code from your invoice or confirmation email (e.g. #FB11E620), plus your checkout email.
          </p>
        </div>

        <GlassCard className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                placeholder="8-char code from invoice (e.g. FB11E620)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Looking up…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track order
                </>
              )}
            </Button>
          </form>
          {user && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Signed in?{' '}
              <Link to="/orders" className="text-primary underline">
                View all orders in your account
              </Link>
            </p>
          )}
        </GlassCard>

        {order && (() => {
          const b = getOrderBreakdown(order);
          return (
          <GlassCard className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Order reference</p>
                <p className="font-mono font-semibold">{displayRef}</p>
                <p className="text-xs text-muted-foreground mt-1 break-all">{order.id}</p>
              </div>
              <Badge className="text-sm">
                {statusLabel[order.status] ?? order.status}
              </Badge>
            </div>

            <OrderDeliveryInfo
              order={order}
              returnPolicy={{
                returns_enabled: storeSettings.returns_enabled,
                return_window_days: storeSettings.return_window_days,
              }}
            />

            <div className="text-sm border-t pt-3">
              <p className="text-muted-foreground">Total paid</p>
              <p className="font-semibold text-green-600 text-lg">
                {b.hasServiceCharge ? formatRs(b.customerPaidRupees) : formatPrice(order.amount / 100)}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Payment breakdown</p>
              <OrderPriceBreakdown order={order} status={order.status} compact />
            </div>

            {order.delivery_address?.fullName && (
              <div className="text-sm border-t pt-4">
                <p className="text-muted-foreground mb-1">Delivering to</p>
                <p className="font-medium">{order.delivery_address.fullName}</p>
                <p className="text-muted-foreground">
                  {order.delivery_address.address}, {order.delivery_address.city},{' '}
                  {order.delivery_address.state} — {order.delivery_address.pincode}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Items</p>
              <ul className="space-y-2 text-sm">
                {(order.items ?? []).map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.product?.name ?? 'Product'} × {item.quantity}
                    </span>
                    <span>{formatPrice((item.product?.price ?? 0) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {order.invoice_url && (
              <Button variant="outline" className="w-full" asChild>
                <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download invoice
                </a>
              </Button>
            )}

            <ReturnRequestSection
              order={order}
              email={email}
              returnPolicy={{
                returns_enabled: storeSettings.returns_enabled,
                return_window_days: storeSettings.return_window_days,
              }}
              onSuccess={() => lookup(orderId, email)}
            />
          </GlassCard>
          );
        })()}
      </div>
      <Footer />
    </Layout>
  );
};

export default TrackOrder;
