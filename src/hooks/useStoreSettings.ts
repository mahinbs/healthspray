import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_SHIPPING_SETTINGS,
  type StoreShippingSettings,
} from '@/lib/shipping';
import {
  DEFAULT_RETURN_POLICY,
  type ReturnPolicySettings,
} from '@/lib/returnPolicy';

export type StoreSettings = StoreShippingSettings & ReturnPolicySettings;

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  ...DEFAULT_SHIPPING_SETTINGS,
  ...DEFAULT_RETURN_POLICY,
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('free_shipping_minimum, delivery_charge, returns_enabled, return_window_days')
          .eq('id', 'default')
          .maybeSingle();

        if (!cancelled && !error && data) {
          setSettings({
            free_shipping_minimum: Number(data.free_shipping_minimum) || DEFAULT_SHIPPING_SETTINGS.free_shipping_minimum,
            delivery_charge: Number(data.delivery_charge) || DEFAULT_SHIPPING_SETTINGS.delivery_charge,
            returns_enabled: data.returns_enabled !== false,
            return_window_days: Number(data.return_window_days) || DEFAULT_RETURN_POLICY.return_window_days,
          });
        }
      } catch {
        /* use defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
