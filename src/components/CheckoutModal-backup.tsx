import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderSuccess } from './OrderSuccess';
import type { Database } from '@/integrations/supabase/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id?: string; // Make optional since we don't use it in fallback
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { state, clearCart } = useCart();
  const { items, total } = state;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');
  const idempotencyKeyRef = React.useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleInputChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields: (keyof DeliveryAddress)[] = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!address[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (address.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (address.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  // Create payment page URL with data
  const createPaymentPageUrl = (orderData: any) => {
    const paymentData = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: 'Painssy - Premium Sports Health',
      description: `Order for ${items.length} item${items.length > 1 ? 's' : ''}`,
      prefill: {
        name: address.fullName,
        contact: address.phone,
      },
      theme: {
        color: '#6366f1',
      },
      orderDbId: orderData.orderDbId
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(paymentData));
    return `/payment-callback?data=${encodedData}`;
  };

  // Create order using Edge Function (primary) with fallback to direct DB
  const createOrder = async (finalAmount: number) => {
    try {
      // Try Edge Function first (proper way for live payments)
      try {
        console.log('Attempting to create order via Edge Function...');
        const { data, error } = await supabase.functions.invoke('create-order', {
          body: {
            amount: finalAmount,
            items: items,
            deliveryAddress: address,
            idempotency_key: idempotencyKeyRef.current,
          },
        });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Edge Function failed');
        }

        console.log('Order created successfully via Edge Function:', data);
        return data;
      } catch (edgeFunctionError) {
        console.warn('Edge Function failed, using fallback method:', edgeFunctionError);
        
        // Fallback: Create order directly in database (for development only)
        const orderInsert: Database['public']['Tables']['orders']['Insert'] = {
          user_id: user?.id || null,
          razorpay_order_id: null,
          amount: Math.round(finalAmount * 100),
          items: items as any,
          delivery_address: address as any,
          status: 'pending',
          idempotency_key: idempotencyKeyRef.current,
        };

        const { data: order, error: dbError } = await supabase
          .from('orders')
          .insert(orderInsert)
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Failed to create order in database');
        }

        console.log('Order created via fallback method:', order.id);
        // Use environment variable or fallback to test key for development
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_iVetw1LEDRlYMN';
        return {
          orderId: null, // No Razorpay order ID for fallback
          amount: Math.round(finalAmount * 100),
          currency: 'INR',
          keyId,
          orderDbId: order.id,
        };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Calculate final amount (free shipping for all orders)
      const finalAmount = total;

      // Create order in database first
      const orderData = await createOrder(finalAmount);

      // Store order data for callback handling
      localStorage.setItem('pendingOrderData', JSON.stringify({
        orderDbId: orderData.orderDbId,
        finalAmount,
        items: items.length
      }));
      
      // Clear any previous payment status
      localStorage.removeItem('paymentSuccess');
      localStorage.removeItem('paymentOrderId');
      localStorage.removeItem('razorpayPaymentId');
      localStorage.removeItem('razorpayOrderId');
      localStorage.removeItem('paymentTimestamp');

      // Create payment page URL
      const paymentPageUrl = createPaymentPageUrl(orderData);

      // Open payment in new tab
      const paymentWindow = window.open(paymentPageUrl, 'razorpay-payment', 'width=800,height=600,scrollbars=yes,resizable=yes');

      if (!paymentWindow) {
        toast.error('Please allow popups for payment processing');
        setLoading(false);
        return;
      }

      // Listen for payment completion
      const checkPaymentStatus = setInterval(async () => {
        if (paymentWindow.closed) {
          clearInterval(checkPaymentStatus);
          
          // Add a small delay to ensure localStorage is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if payment was successful
          const paymentSuccess = localStorage.getItem('paymentSuccess');
          const paymentOrderId = localStorage.getItem('paymentOrderId');
          const razorpayPaymentId = localStorage.getItem('razorpayPaymentId');
          const razorpayOrderId = localStorage.getItem('razorpayOrderId');

          console.log('Payment window closed. Status:', {
            paymentSuccess,
            paymentOrderId,
            razorpayPaymentId,
            razorpayOrderId
          });

          if (paymentSuccess === 'true' && paymentOrderId && razorpayPaymentId && razorpayOrderId) {
            try {
              // Update order with payment details
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  razorpay_order_id: razorpayOrderId,
                  razorpay_payment_id: razorpayPaymentId,
                  status: 'paid',
                })
                .eq('id', paymentOrderId);

              if (updateError) {
                console.error('Error updating order:', updateError);
                toast.error('Payment completed but order update failed. Please contact support.');
              } else {
                console.log('Order updated successfully');
                // Success - redirect to orders page
                clearCart();
                onClose();
                toast.success('Payment completed successfully!');
                // Redirect to orders page
                window.location.href = '/orders';
              }
            } catch (error) {
              console.error('Error processing payment success:', error);
              toast.error('Payment completed but order update failed. Please contact support.');
            }

            // Clear localStorage
            localStorage.removeItem('paymentSuccess');
            localStorage.removeItem('paymentOrderId');
            localStorage.removeItem('razorpayPaymentId');
            localStorage.removeItem('razorpayOrderId');
            localStorage.removeItem('paymentTimestamp');
            localStorage.removeItem('pendingOrderData');

            // Regenerate idempotency key for next order
            idempotencyKeyRef.current =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          } else {
            console.log('Payment was cancelled or failed');
            // Payment was cancelled or failed
            localStorage.removeItem('pendingOrderData');
            localStorage.removeItem('paymentSuccess');
            localStorage.removeItem('paymentOrderId');
            localStorage.removeItem('razorpayPaymentId');
            localStorage.removeItem('razorpayOrderId');
            localStorage.removeItem('paymentTimestamp');
            
            // Regenerate key on cancel to avoid stale key reuse
            idempotencyKeyRef.current =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            toast.info('Payment was cancelled or failed');
          }
          
          setLoading(false);
        }
      }, 500); // Check every 500ms instead of 1000ms for faster response

      // Set timeout to close payment window after 10 minutes
      setTimeout(() => {
        if (!paymentWindow.closed) {
          paymentWindow.close();
          clearInterval(checkPaymentStatus);
          setLoading(false);
          localStorage.removeItem('pendingOrderData');
          localStorage.removeItem('paymentSuccess');
          localStorage.removeItem('paymentOrderId');
          localStorage.removeItem('razorpayPaymentId');
          localStorage.removeItem('razorpayOrderId');
          localStorage.removeItem('paymentTimestamp');
          toast.error('Payment timeout. Please try again.');
        }
      }, 600000); // 10 minutes

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const finalAmount = total;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Delivery Address Form */}
            <div className="space-y-3">
              <h3 className="font-semibold">Delivery Address</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={address.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={address.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Items ({items.length})</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total</span>
                  <span>₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Opening Payment...' : `Pay ₹${finalAmount.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderSuccess
        isOpen={showOrderSuccess}
        onClose={() => setShowOrderSuccess(false)}
        orderId={successOrderId}
        orderTotal={finalAmount}
      />
    </>
  );
};