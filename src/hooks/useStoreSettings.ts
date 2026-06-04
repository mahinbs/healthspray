import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_SHIPPING_SETTINGS,
  type StoreShippingSettings,
} from '@/lib/shipping';

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('free_shipping_minimum, delivery_charge')
          .eq('id', 'default')
          .maybeSingle();

        if (!cancelled && !error && data) {
          setSettings({
            free_shipping_minimum: Number(data.free_shipping_minimum) || DEFAULT_SHIPPING_SETTINGS.free_shipping_minimum,
            delivery_charge: Number(data.delivery_charge) || DEFAULT_SHIPPING_SETTINGS.delivery_charge,
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
