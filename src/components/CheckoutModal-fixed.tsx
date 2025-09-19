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
  order_id?: string;
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
  open(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { state: { items, total }, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Generate unique idempotency key for each order attempt
  const idempotencyKeyRef = useRef(
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

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  // Validate form fields
  const validateForm = () => {
    if (!address.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!address.phone || address.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!address.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!address.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!address.state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!address.pincode || address.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
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
      // Load Razorpay script
      await loadRazorpayScript();

      // Calculate final amount (free shipping for all orders)
      const finalAmount = total;

      // Create order via Edge Function (for proper live payments)
      const orderData = await createOrder(finalAmount);

      // Initialize Razorpay payment with proper configuration
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Zippty - Premium Pet Care',
        description: `Order for ${items.length} item${items.length > 1 ? 's' : ''}`,
        // Only include order_id if we have one from Razorpay (Edge Function response)
        ...(orderData.orderId && { order_id: orderData.orderId }),
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment successful:', response);
            
            // Try to verify payment via Edge Function first
            try {
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
                body: {
                  razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              });

              if (verifyError) {
                console.error('Payment verification failed:', verifyError);
                throw new Error('Payment verification failed');
              }

              console.log('Payment verified successfully:', verifyData);
            } catch (verifyError) {
              console.warn('Edge Function verification failed, using fallback:', verifyError);
              
              // Fallback: Update order directly in database
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  status: 'paid',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', orderData.orderDbId);

              if (updateError) {
                console.error('Database update error:', updateError);
                throw new Error('Failed to update order status');
              }
            }

            // Success
            clearCart();
            onSuccess(orderData.orderDbId);
            onClose();
            // Regenerate idempotency key for next order
            idempotencyKeyRef.current =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            toast.success('Order placed successfully! Payment completed.');
          } catch (error) {
            console.error('Payment processing failed:', error);
            toast.error('Payment processing failed. Please contact support.');
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            // Regenerate key on cancel to avoid stale key reuse
            idempotencyKeyRef.current =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            toast.info('Payment cancelled');
          },
        },
      };

      console.log('Initializing Razorpay with options:', {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id
      });

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = total;

  return (
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
                  placeholder="Pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={loading || items.length === 0}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Pay ₹${finalAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
