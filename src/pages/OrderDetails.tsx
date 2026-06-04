import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package2, MapPin, Download, CreditCard, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { OrderPriceBreakdown } from '@/components/OrderPriceBreakdown';
import { getOrderBreakdown, formatRs } from '@/lib/orderBreakdown';
import { ReturnRequestSection } from '@/components/ReturnRequestSection';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  amount: number;
  items: OrderItem[];
  delivery_address: DeliveryAddress;
  status: string;
  created_at: string;
  payment_mode?: string;
  icici_txn_id?: string;
  icici_payment_id?: string;
  invoice_number?: string;
  invoice_url?: string;
  invoice_generated_at?: string;
  coupon_code?: string;
  coupon_discount?: number;
  shipping_fee?: number;
  service_charge?: number;
  total_paid?: number;
  payment_sub_inst_type?: string;
  delivered_at?: string | null;
  return_reason?: string | null;
  return_requested_at?: string | null;
}

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const { settings: storeSettings } = useStoreSettings();

  const fetchOrder = async () => {
    if (!orderId) {
      navigate('/');
      return;
    }
    if (!user) {
      navigate(`/track-order?orderId=${encodeURIComponent(orderId)}`);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) { toast.error('Order not found'); navigate('/orders'); return; }

      setOrder({
        ...data,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
        delivery_address: typeof data.delivery_address === 'string'
          ? JSON.parse(data.delivery_address)
          : data.delivery_address,
      } as Order);
    } catch {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId, user]);

  const handleDownloadInvoice = () => {
    if (order?.invoice_url) {
      window.open(order.invoice_url, '_blank');
    }
  };

  const handleRegenerateInvoice = async () => {
    if (!order) return;
    setGeneratingInvoice(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { orderId: order.id },
      });
      if (error || !data?.success) throw new Error('Failed to generate invoice');
      toast.success('Invoice generated!');
      await fetchOrder();
    } catch {
      toast.error('Invoice generation failed. Please try again.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Order not found</h2>
          <Button onClick={() => navigate('/orders')}>View All Orders</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{label}</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{label}</Badge>;
      case 'shipped': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{label}</Badge>;
      case 'delivered': return <Badge className="bg-green-100 text-green-800">{label}</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{label}</Badge>;
      case 'cancelled': return <Badge variant="secondary">{label}</Badge>;
      default: return <Badge variant="secondary">{label}</Badge>;
    }
  };

  const breakdown = getOrderBreakdown(order);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Your Orders
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
                <span>
                  {breakdown.hasServiceCharge
                    ? `Paid ${formatRs(breakdown.customerPaidRupees)}`
                    : `Total ${formatRs(breakdown.merchantTotalRupees)}`}
                </span>
                {order.invoice_number && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {order.invoice_number}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {order.invoice_url ? (
                <Button size="sm" variant="outline" onClick={handleDownloadInvoice}>
                  <Download className="h-4 w-4 mr-1" />
                  Invoice
                </Button>
              ) : order.status === 'paid' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateInvoice}
                  disabled={generatingInvoice}
                >
                  {generatingInvoice
                    ? <><RefreshCw className="h-4 w-4 mr-1 animate-spin" />Generating...</>
                    : <><FileText className="h-4 w-4 mr-1" />Get Invoice</>}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border rounded-lg">
              <div className="p-4 border-b flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                <span className="font-medium capitalize">{order.status}</span>
              </div>
              <div className="p-4 space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                    <img
                      src={item.product.image || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">{item.product.name}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium">₹{item.product.price.toLocaleString()}</span>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <span className="text-muted-foreground line-through">₹{item.product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/shop')}>
                      Buy again
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-3">Order Summary</h3>
              <OrderPriceBreakdown order={order} status={order.status} />
            </div>

            {/* Shipping Address */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.delivery_address?.fullName}</p>
                <p className="text-muted-foreground">{order.delivery_address?.address}</p>
                <p className="text-muted-foreground">
                  {order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}
                </p>
                <p className="text-muted-foreground">Phone: {order.delivery_address?.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            {(order.payment_mode || order.icici_txn_id || order.icici_payment_id) && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </h3>
                <div className="text-sm space-y-2">
                  {order.payment_mode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">{order.payment_mode}</span>
                    </div>
                  )}
                  {order.icici_payment_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID</span>
                      <span className="font-mono text-xs">{order.icici_payment_id}</span>
                    </div>
                  )}
                  {order.icici_txn_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Txn ID</span>
                      <span className="font-mono text-xs">{order.icici_txn_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-card border rounded-lg p-4">
              <ReturnRequestSection
                order={order}
                email={user?.email ?? order.delivery_address?.email ?? ''}
                returnPolicy={{
                  returns_enabled: storeSettings.returns_enabled,
                  return_window_days: storeSettings.return_window_days,
                }}
                onSuccess={fetchOrder}
              />
            </div>

            {/* Invoice */}
            {(order.invoice_number || order.invoice_url) && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice
                </h3>
                <div className="text-sm space-y-2">
                  {order.invoice_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice No</span>
                      <span className="font-medium">{order.invoice_number}</span>
                    </div>
                  )}
                  {order.invoice_generated_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generated</span>
                      <span>{new Date(order.invoice_generated_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {order.invoice_url && (
                    <Button size="sm" className="w-full mt-2" onClick={handleDownloadInvoice}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF Invoice
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
