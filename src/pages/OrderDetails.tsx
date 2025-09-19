import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  razorpay_payment_id?: string;
}

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          toast.error('Order not found');
          navigate('/');
          return;
        }

        // Parse the JSON data properly
        const parsedOrder = {
          ...data,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          delivery_address: typeof data.delivery_address === 'string' ? JSON.parse(data.delivery_address) : data.delivery_address
        } as Order;
        
        setOrder(parsedOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Order not found</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">{statusText}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{statusText}</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">{statusText}</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">{statusText}</Badge>;
      default:
        return <Badge variant="secondary">{statusText}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Your Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Order Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-normal mb-2">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Order placed {new Date(order.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span>Total ₹{(order.amount / 100).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b">
                <h2 className="font-medium flex items-center gap-2 capitalize">
                  <Package2 className="h-4 w-4" />
                  {order.status}
                </h2>
              </div>
              
              <div className="p-4 space-y-4">
                {order.items.map((item: OrderItem, index: number) => {
                  const { product } = item;
                  return (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 leading-tight">
                          {product.name}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">₹{product.price.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/shop')}>
                          Buy it again
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>₹{(order.amount / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Order Total</span>
                  <span>₹{(order.amount / 100).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.delivery_address?.fullName}</p>
                <p>{order.delivery_address?.address}</p>
                <p>
                  {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.pincode}
                </p>
                <p>Phone: {order.delivery_address?.phone}</p>
              </div>
            </div>

            {/* Payment Information */}
            {order.razorpay_payment_id && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-3">Payment Information</h3>
                <div className="text-sm space-y-1">
                  <p>Payment Method: Online Payment</p>
                  <p className="text-muted-foreground">Payment ID: {order.razorpay_payment_id}</p>
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