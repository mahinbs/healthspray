-- Admin-configurable free shipping threshold and delivery charge
CREATE TABLE IF NOT EXISTS public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  free_shipping_minimum numeric NOT NULL DEFAULT 500 CHECK (free_shipping_minimum >= 0),
  delivery_charge numeric NOT NULL DEFAULT 49 CHECK (delivery_charge >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.store_settings (id, free_shipping_minimum, delivery_charge)
VALUES ('default', 500, 49)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read store settings" ON public.store_settings;
CREATE POLICY "Anyone can read store settings"
  ON public.store_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage store settings" ON public.store_settings;
CREATE POLICY "Admins manage store settings"
  ON public.store_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
