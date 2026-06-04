import { useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { computeGrandTotal } from '@/lib/shipping';

export function useCartTotals() {
  const { state } = useCart();
  const { settings, loading: settingsLoading } = useStoreSettings();

  return useMemo(() => {
    const discount = state.couponApplied?.discountAmount ?? 0;
    const totals = computeGrandTotal(state.total, discount, settings);
    return {
      ...totals,
      subtotal: state.total,
      discount,
      settings,
      settingsLoading,
    };
  }, [state.total, state.couponApplied, settings, settingsLoading]);
}
