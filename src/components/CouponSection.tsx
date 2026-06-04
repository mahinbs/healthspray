import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tag, X, Loader2 } from 'lucide-react';

interface CouponRow {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_discount: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  usage_limit_per_user: number;
  total_usage_limit: number | null;
  total_usage: number;
  min_cart_value: number | null;
  description?: string | null;
}

interface CouponSectionProps {
  className?: string;
}

function computeDiscount(subtotal: number, coupon: CouponRow): number {
  const couponValue = Number(coupon.value);
  if (Number.isNaN(couponValue) || couponValue <= 0) {
    throw new Error('Invalid coupon value');
  }
  if (coupon.type !== 'percentage' && coupon.type !== 'fixed') {
    throw new Error('Invalid coupon type');
  }

  let discount =
    coupon.type === 'percentage'
      ? (subtotal * couponValue) / 100
      : couponValue;

  if (coupon.type === 'percentage' && coupon.max_discount) {
    const maxDiscount = Number(coupon.max_discount);
    if (!Number.isNaN(maxDiscount) && maxDiscount > 0) {
      discount = Math.min(discount, maxDiscount);
    }
  }

  discount = Math.min(discount, subtotal);
  if (Number.isNaN(discount) || discount < 0) {
    throw new Error('Invalid discount calculation');
  }
  return Number(discount.toFixed(2));
}

export const CouponSection: React.FC<CouponSectionProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { state, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<CouponRow[]>([]);
  const [showCouponsPopup, setShowCouponsPopup] = useState(false);

  const getSubtotal = useCallback(
    () =>
      state.items.reduce((acc, item) => {
        const price = Number(item.product.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return acc + price * quantity;
      }, 0),
    [state.items]
  );

  const loadAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const validCoupons =
        (coupons as CouponRow[])?.filter((coupon) => {
          const startDate = new Date(coupon.starts_at);
          const endDate = new Date(coupon.ends_at);
          return now >= startDate && now <= endDate;
        }) ?? [];

      setAvailableCoupons(validCoupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    loadAvailableCoupons();
  }, []);

  const validateAndApply = async (coupon: CouponRow) => {
    const subtotal = getSubtotal();

    if (Number.isNaN(subtotal) || subtotal <= 0) {
      throw new Error('Add items to your cart first');
    }

    const now = new Date();
    if (now < new Date(coupon.starts_at) || now > new Date(coupon.ends_at)) {
      throw new Error('Coupon is not active');
    }

    if (coupon.min_cart_value && subtotal < coupon.min_cart_value) {
      throw new Error(`Minimum cart value of ₹${coupon.min_cart_value} required for this coupon`);
    }

    if (
      coupon.total_usage_limit !== null &&
      coupon.total_usage >= coupon.total_usage_limit
    ) {
      throw new Error('Coupon usage limit reached');
    }

    if (user) {
      const { count: userCount } = await supabase
        .from('coupon_usages')
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id);

      if ((userCount || 0) >= (coupon.usage_limit_per_user ?? 1)) {
        throw new Error('You have already used this coupon');
      }
    }

    const discount = computeDiscount(subtotal, coupon);

    applyCoupon({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      max_discount: coupon.max_discount ? Number(coupon.max_discount) : null,
      discountAmount: discount,
    });

    toast.success(`Coupon ${coupon.code} applied! You saved ₹${discount.toFixed(2)}`);
  };

  const handleApplyCouponFromList = async (coupon: CouponRow) => {
    setApplyingCoupon(true);
    try {
      await validateAndApply(coupon);
      setShowCouponsPopup(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !coupon) {
        throw new Error('Invalid coupon code');
      }

      await validateAndApply(coupon as CouponRow);
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

  const openCouponsPopup = () => {
    setShowCouponsPopup(true);
    if (availableCoupons.length === 0) {
      loadAvailableCoupons();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
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
            {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={openCouponsPopup}
        className="w-full h-7 px-3 text-xs"
        disabled={!!state.couponApplied}
      >
        {loadingCoupons
          ? 'Loading offers…'
          : availableCoupons.length > 0
            ? `View Available Coupons (${availableCoupons.length})`
            : 'View Available Coupons'}
      </Button>

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
                  : `₹${state.couponApplied.value} off`}
                {state.couponApplied.max_discount &&
                  ` (max ₹${state.couponApplied.max_discount})`}
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
                No active coupons right now. Enter a code above if you have one.
              </p>
            ) : (
              availableCoupons.map((coupon) => (
                <div key={coupon.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold">{coupon.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}% off`
                          : `₹${coupon.value} off`}
                        {coupon.max_discount && ` (max ₹${coupon.max_discount})`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApplyCouponFromList(coupon)}
                      disabled={applyingCoupon || !!state.couponApplied}
                    >
                      {applyingCoupon ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {coupon.description && (
                    <div className="text-sm text-muted-foreground">{coupon.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Valid until: {new Date(coupon.ends_at).toLocaleDateString()}
                    {coupon.min_cart_value
                      ? ` • Min cart: ₹${coupon.min_cart_value}`
                      : ''}
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
