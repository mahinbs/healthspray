import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tag, X, Loader2 } from 'lucide-react';

interface CouponSectionProps {
  className?: string;
}

export const CouponSection: React.FC<CouponSectionProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { state, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCouponsPopup, setShowCouponsPopup] = useState(false);

  // Load available coupons
  const loadAvailableCoupons = async () => {
    if (!user) return;
    
    setLoadingCoupons(true);
    try {
      const { data: coupons, error } = await supabase
        .from('coupons' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter coupons that are currently valid
      const now = new Date();
      const validCoupons = (coupons as any[])?.filter((coupon: any) => {
        const startDate = new Date(coupon.starts_at);
        const endDate = new Date(coupon.ends_at);
        return now >= startDate && now <= endDate;
      }) || [];

      setAvailableCoupons(validCoupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAvailableCoupons();
    }
  }, [user]);

  // Apply coupon from available list
  const handleApplyCouponFromList = async (coupon: any) => {
    if (!user) {
      toast.error('Login to apply a coupon');
      return;
    }
    
    setApplyingCoupon(true);
    try {
      // Check minimum cart value
      const subtotal = state.items.reduce((acc, item) => {
        const price = Number(item.product.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return acc + (price * quantity);
      }, 0);
      
      if (isNaN(subtotal) || subtotal <= 0) {
        throw new Error('Invalid cart total');
      }
      
      if ((coupon as any).min_cart_value && subtotal < (coupon as any).min_cart_value) {
        throw new Error(`Minimum cart value of ₹${(coupon as any).min_cart_value} required for this coupon`);
      }

      // Check per-user usage
      const { count: userCount } = await supabase
        .from('coupon_usages' as any)
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', (coupon as any).id)
        .eq('user_id', user.id);

      if ((userCount || 0) >= ((coupon as any).usage_limit_per_user ?? 1)) {
        throw new Error('You have already used this coupon');
      }

      // Compute discount
      let discount = 0;
      
      // Validate coupon value
      const couponValue = Number((coupon as any).value);
      if (isNaN(couponValue) || couponValue <= 0) {
        throw new Error('Invalid coupon value');
      }
      
      // Validate coupon type
      const couponType = (coupon as any).type;
      if (!couponType || (couponType !== 'percentage' && couponType !== 'fixed')) {
        throw new Error('Invalid coupon type');
      }
      
      if (couponType === 'percentage') {
        discount = (subtotal * couponValue) / 100;
        if ((coupon as any).max_discount) {
          const maxDiscount = Number((coupon as any).max_discount);
          if (!isNaN(maxDiscount) && maxDiscount > 0) {
            discount = Math.min(discount, maxDiscount);
          }
        }
      } else {
        discount = couponValue;
      }
      
      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal);
      
      // Ensure discount is a valid number
      if (isNaN(discount) || discount < 0) {
        throw new Error('Invalid discount calculation');
      }

      applyCoupon({
        id: (coupon as any).id,
        code: (coupon as any).code,
        type: (coupon as any).type,
        value: Number((coupon as any).value),
        max_discount: (coupon as any).max_discount ? Number((coupon as any).max_discount) : null,
        discountAmount: Number(discount.toFixed(2)),
      });
      
      toast.success(`Coupon ${(coupon as any).code} applied! You saved ₹${discount.toFixed(2)}`);
      setShowCouponsPopup(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Apply coupon from input
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (!user) {
      toast.error('Login to apply a coupon');
      return;
    }
    
    setApplyingCoupon(true);
    try {
      // Find coupon by code
      const { data: coupons, error } = await supabase
        .from('coupons' as any)
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupons) {
        throw new Error('Invalid coupon code');
      }

      const coupon = coupons as any;

      // Date window
      const now = new Date();
      if (now < new Date((coupon as any).starts_at) || now > new Date((coupon as any).ends_at)) {
        throw new Error('Coupon is not active');
      }

      // Check minimum cart value
      const subtotal = Number(state.total) || 0;
      
      if (isNaN(subtotal) || subtotal <= 0) {
        throw new Error('Invalid cart total');
      }
      
      if ((coupon as any).min_cart_value && subtotal < (coupon as any).min_cart_value) {
        throw new Error(`Minimum cart value of ₹${(coupon as any).min_cart_value} required for this coupon`);
      }

      // Total usage limit
      if ((coupon as any).total_usage_limit !== null && (coupon as any).total_usage >= (coupon as any).total_usage_limit) {
        throw new Error('Coupon usage limit reached');
      }

      // Per-user usage
      const { count: userCount } = await supabase
        .from('coupon_usages' as any)
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', (coupon as any).id)
        .eq('user_id', user.id);

      if ((userCount || 0) >= ((coupon as any).usage_limit_per_user ?? 1)) {
        throw new Error('You have already used this coupon');
      }

      // Compute discount
      let discount = 0;
      
      // Validate coupon value
      const couponValue = Number((coupon as any).value);
      if (isNaN(couponValue) || couponValue <= 0) {
        throw new Error('Invalid coupon value');
      }
      
      // Validate coupon type
      const couponType = (coupon as any).type;
      if (!couponType || (couponType !== 'percentage' && couponType !== 'fixed')) {
        throw new Error('Invalid coupon type');
      }
      
      if (couponType === 'percentage') {
        discount = (subtotal * couponValue) / 100;
        if ((coupon as any).max_discount) {
          const maxDiscount = Number((coupon as any).max_discount);
          if (!isNaN(maxDiscount) && maxDiscount > 0) {
            discount = Math.min(discount, maxDiscount);
          }
        }
      } else {
        discount = couponValue;
      }
      
      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal);
      
      // Ensure discount is a valid number
      if (isNaN(discount) || discount < 0) {
        throw new Error('Invalid discount calculation');
      }

      applyCoupon({
        id: (coupon as any).id,
        code: (coupon as any).code,
        type: (coupon as any).type,
        value: Number((coupon as any).value),
        max_discount: (coupon as any).max_discount ? Number((coupon as any).max_discount) : null,
        discountAmount: Number(discount.toFixed(2)),
      });
      
      toast.success(`Coupon ${(coupon as any).code} applied! You saved ₹${discount.toFixed(2)}`);
      setCouponCode('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Coupon Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Coupon Code</Label>
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="flex-1"
            disabled={applyingCoupon || !!state.couponApplied}
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={applyingCoupon || !couponCode.trim() || !!state.couponApplied}
            size="sm"
            className="px-4"
          >
            {applyingCoupon ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </div>

      {/* Available Coupons Button */}
      {availableCoupons.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCouponsPopup(true)}
          className="w-full h-7 px-3 text-xs"
          disabled={!!state.couponApplied}
        >
          View Available Coupons ({availableCoupons.length})
        </Button>
      )}

      {/* Applied Coupon Display */}
      {state.couponApplied && (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                {state.couponApplied.code}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {state.couponApplied.type === 'percentage' 
                  ? `${state.couponApplied.value}% off` 
                  : `₹${state.couponApplied.value} off`
                }
                {state.couponApplied.max_discount && ` (max ₹${state.couponApplied.max_discount})`}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Available Coupons Popup */}
      <Dialog open={showCouponsPopup} onOpenChange={setShowCouponsPopup}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Available Coupons</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {loadingCoupons ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availableCoupons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No coupons available at the moment.
              </p>
            ) : (
              availableCoupons.map((coupon: any) => (
                <div key={coupon.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{coupon.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                        {coupon.max_discount && ` (max ₹${coupon.max_discount})`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApplyCouponFromList(coupon)}
                      disabled={applyingCoupon}
                    >
                      {applyingCoupon ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {coupon.description && (
                    <div className="text-sm text-gray-600">
                      {coupon.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Valid until: {new Date(coupon.ends_at).toLocaleDateString()}
                    {coupon.min_cart_value && ` • Min cart: ₹${coupon.min_cart_value}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
