import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle, Calendar, MapPin, Phone, User } from 'lucide-react';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import { formatPrice } from '@/services/api';
import { toast } from 'sonner';

interface Order {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  items: any[];
  delivery_address: any;
  created_at: string;
  updated_at: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderId, orders]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data as Order[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  // Single order view
  if (selectedOrder) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/orders')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Info */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Order #{selectedOrder.id.slice(-8)}</h2>
                    <p className="text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Items Ordered</h3>
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Delivery Address */}
              <GlassCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {selectedOrder.delivery_address.fullName}
                  </p>
                  <p className="text-muted-foreground flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedOrder.delivery_address.phone}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.delivery_address.address}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}
                  </p>
                </div>
              </GlassCard>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6 sticky top-24">
                <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  {(() => {
                    const totalAmount = selectedOrder.amount / 100; // Convert from paise to rupees
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-foreground">{formatPrice(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-foreground">Free</span>
                        </div>
                        <div className="border-t border-border pt-3">
                          <div className="flex justify-between">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-bold text-primary">
                              {formatPrice(totalAmount)}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {selectedOrder.razorpay_payment_id && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-xs text-foreground break-all">
                      {selectedOrder.razorpay_payment_id}
                    </p>
                  </div>
                )}

                {selectedOrder.status === 'paid' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Order Confirmed</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Your order will be delivered within 5-7 business days
                    </p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
        
        <Footer />
      </Layout>
    );
  }

  // Orders list view
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">No Orders Yet</h2>
            <p className="text-muted-foreground mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button 
              onClick={() => navigate('/shop')}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <GlassCard key={order.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Order #{order.id.slice(-8)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="font-semibold text-primary">
                      {formatPrice(order.amount / 100)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/${order.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </Layout>
  );
};

export default Orders;