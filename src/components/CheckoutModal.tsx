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
import { PopupGuide } from './PopupGuide';

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

// Windowed Payment Implementation
export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { state: { items, total }, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPopupGuide, setShowPopupGuide] = useState(false);
  
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

  // Create order using Edge Function
  const createOrder = async (finalAmount: number) => {
    try {
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
        throw new Error(error.message || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Create payment page content
  const createPaymentPageContent = (orderData: any) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment - Painssy</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .payment-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        .logo {
            color: #6366f1;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
        }
        .pay-button {
            background: #6366f1;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: background 0.2s;
        }
        .pay-button:hover {
            background: #5855eb;
        }
        .pay-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .loading {
            display: none;
            margin-top: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .order-details {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: left;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="payment-container">
        <div class="logo">💪 Physiq</div>
        <div class="order-details">
            <div><strong>Items:</strong> ${items.length} item${items.length > 1 ? 's' : ''}</div>
            <div><strong>Customer:</strong> ${address.fullName}</div>
            <div><strong>Phone:</strong> ${address.phone}</div>
        </div>
        <div class="amount">₹${(orderData.amount / 100).toFixed(2)}</div>
        <button id="payButton" class="pay-button" onclick="initiatePayment()">
            Pay Securely with Razorpay
        </button>
        <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Processing payment...</p>
        </div>
    </div>

    <script>
        const orderData = ${JSON.stringify(orderData)};
        const addressData = ${JSON.stringify(address)};
        
        function showLoading() {
            document.getElementById('payButton').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
        }
        
        function hideLoading() {
            document.getElementById('payButton').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
        }
        
        function initiatePayment() {
            showLoading();
            
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.orderId,
                name: 'Physiq - Premium Sports Health',
                description: 'Order for ${items.length} item${items.length > 1 ? 's' : ''}',
                handler: function(response) {
                    // Send success message to parent window
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'PAYMENT_SUCCESS',
                            data: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderDbId: orderData.orderDbId
                            }
                        }, '*');
                    }
                    window.close();
                },
                prefill: {
                    name: addressData.fullName,
                    contact: addressData.phone
                },
                theme: {
                    color: '#6366f1'
                },
                modal: {
                    ondismiss: function() {
                        // Send cancel message to parent window
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'PAYMENT_CANCELLED'
                            }, '*');
                        }
                        window.close();
                    }
                }
            };
            
            const rzp = new Razorpay(options);
            rzp.open();
            hideLoading();
        }
        
        // Auto-start payment when page loads
        window.onload = function() {
            setTimeout(initiatePayment, 1000);
        };
    </script>
</body>
</html>`;
  };

  // Detect if user is on mobile device
  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (typeof window.orientation !== "undefined") ||
           (navigator.maxTouchPoints > 0);
  };

  // Show popup blocker help
  const showPopupHelp = () => {
    setShowPopupGuide(true);
    setLoading(false);
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

      // Create order via Edge Function
      const orderData = await createOrder(finalAmount);

      // Check if mobile and warn user
      if (isMobileDevice()) {
        toast.info('Opening payment in new window. Please complete payment and return to this page.', 
          { duration: 5000 });
      }

      // Create payment window with mobile-friendly dimensions
      const windowFeatures = isMobileDevice() 
        ? 'width=400,height=600,scrollbars=yes,resizable=yes'
        : 'width=500,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no';
      
      const paymentWindow = window.open('', 'razorpay-payment', windowFeatures);

      if (!paymentWindow) {
        showPopupHelp();
        setLoading(false);
        return;
      }

      // Double-check that window actually opened (some browsers return a window object even when blocked)
      setTimeout(() => {
        try {
          if (paymentWindow.closed || !paymentWindow.location) {
            showPopupHelp();
            setLoading(false);
            return;
          }
        } catch (e) {
          // This is expected for cross-origin windows, so window is likely open
        }
      }, 100);

      // Write payment page content to the window
      paymentWindow.document.write(createPaymentPageContent(orderData));
      paymentWindow.document.close();

      // Listen for messages from payment window
      const handleMessage = async (event: MessageEvent) => {
        // Security: Check origin if needed
        // if (event.origin !== 'expected-origin') return;

        if (event.data.type === 'PAYMENT_SUCCESS') {
          const { data: paymentData } = event.data;
          
          try {
            // Verify payment via Edge Function
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
              },
            });

            if (verifyError) {
              throw new Error('Payment verification failed');
            }

            // Success
            clearCart();
            onSuccess(paymentData.orderDbId);
            onClose();
            toast.success('Order placed successfully! Payment completed.');
            
            // Regenerate idempotency key
            idempotencyKeyRef.current =
              typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment processing failed. Please contact support.');
          }
        } else if (event.data.type === 'PAYMENT_CANCELLED') {
          toast.info('Payment was cancelled');
          // Regenerate idempotency key
          idempotencyKeyRef.current =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }

        // Cleanup
        window.removeEventListener('message', handleMessage);
        setLoading(false);
      };

      // Add message listener
      window.addEventListener('message', handleMessage);

      // Handle window close without payment
      const checkWindowClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handleMessage);
          setLoading(false);
          
          // Show retry option
          toast.error('Payment window was closed. Click "Pay" to try again.', {
            duration: 6000,
            action: {
              label: 'Try Again',
              onClick: () => handlePayment(),
            },
          });
          
          // Regenerate idempotency key
          idempotencyKeyRef.current =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
      }, 1000);

      // Timeout handler - close window after 10 minutes
      const timeoutHandler = setTimeout(() => {
        if (!paymentWindow.closed) {
          paymentWindow.close();
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handleMessage);
          setLoading(false);
          toast.error('Payment session expired. Please try again.');
          
          // Regenerate idempotency key
          idempotencyKeyRef.current =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
      }, 600000); // 10 minutes

      // Cleanup timeout when payment completes
      const originalHandleMessage = handleMessage;
      const enhancedHandleMessage = async (event: MessageEvent) => {
        clearTimeout(timeoutHandler);
        return originalHandleMessage(event);
      };

      // Replace the message handler
      window.removeEventListener('message', handleMessage);
      window.addEventListener('message', enhancedHandleMessage);

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
              <p className="text-gray-500">*Inclusive of all taxes</p>
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
              {loading ? 'Opening Payment Window...' : `Pay ₹${finalAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <PopupGuide
      isOpen={showPopupGuide}
      onClose={() => setShowPopupGuide(false)}
      onRetry={() => {
        setShowPopupGuide(false);
        handlePayment();
      }}
    />
    </>
  );
};
