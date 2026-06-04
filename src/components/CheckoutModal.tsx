import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Shield, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

interface DeliveryAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { state: { items, total, couponApplied } } = useCart();
  const { grandTotal, shippingFee, isFreeShipping, settings } = useCartTotals();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const idempotencyKeyRef = useRef(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user?.email) {
      setAddress((prev) => ({ ...prev, email: prev.email || user.email! }));
    }
  }, [user?.email]);

  const handleInputChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!address.fullName.trim()) { toast.error('Please enter your full name'); return false; }
    if (!address.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!address.phone || address.phone.length !== 10) { toast.error('Please enter a valid 10-digit phone number'); return false; }
    if (!address.address.trim()) { toast.error('Please enter your address'); return false; }
    if (!address.city.trim()) { toast.error('Please enter your city'); return false; }
    if (!address.state.trim()) { toast.error('Please enter your state'); return false; }
    if (!address.pincode || address.pincode.length !== 6) { toast.error('Please enter a valid 6-digit pincode'); return false; }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('icici-initiate-payment', {
        body: {
          amount: grandTotal,
          shippingFee,
          items,
          deliveryAddress: address,
          idempotency_key: idempotencyKeyRef.current,
          coupon: couponApplied
            ? {
                code: couponApplied.code,
                type: couponApplied.type,
                value: couponApplied.value,
                discount: couponApplied.discountAmount,
              }
            : null,
        },
      });

      if (error) {
        const ctx = (error as { context?: Response })?.context;
        let serverMsg = error.message;
        if (ctx) {
          try {
            const parsed = await ctx.json();
            if (parsed?.error) serverMsg = parsed.error;
          } catch {
            /* use default message */
          }
        }
        throw new Error(serverMsg || 'Failed to initiate payment');
      }
      if (data?.error) throw new Error(data.error);
      if (!data?.success || !data?.paymentUrl) throw new Error(data.error || 'Invalid payment response');

      // Store order details for payment return page (guest tracking)
      sessionStorage.setItem('pending_order_id', data.orderId);
      sessionStorage.setItem('pending_order_email', address.email.trim());

      toast.success('Redirecting to payment gateway...');

      // Full-page redirect to ICICI payment page
      window.location.href = data.paymentUrl;

    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
      setLoading(false);

      // Regenerate idempotency key on failure
      idempotencyKeyRef.current =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
  };

  const finalAmount = grandTotal;

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Delivery Address Form */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Delivery Address</h3>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={address.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter full name"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={address.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
                maxLength={10}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="House/Flat no., Street, Locality"
                className="min-h-[72px]"
                disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={address.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                  placeholder="6 digits"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({couponApplied.code})</span>
                  <span>- ₹{couponApplied.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={isFreeShipping ? 'text-green-600 font-medium' : ''}>
                  {isFreeShipping ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {!isFreeShipping && (
                <p className="text-xs text-muted-foreground">
                  Free delivery on orders ₹{settings.free_shipping_minimum}+
                </p>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">*Inclusive of all taxes</p>
            </div>
          </div>

          {/* Payment notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-700 dark:text-blue-300">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <span>You will be redirected to ICICI Bank's secure payment gateway to complete your payment.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || items.length === 0}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : `Pay ₹${finalAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
