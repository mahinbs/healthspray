-- ── Coupon visibility: 'public' = guests + members, 'members_only' = logged-in only ──
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'members_only'));

-- ── Guest coupon usage tracking (by email AND phone) ──
CREATE TABLE IF NOT EXISTS guest_coupon_usages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  order_id    UUID REFERENCES public.orders(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  -- At least one identifier required
  CONSTRAINT guest_usage_needs_identifier CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_guest_coupon_email  ON guest_coupon_usages(coupon_id, email);
CREATE INDEX IF NOT EXISTS idx_guest_coupon_phone  ON guest_coupon_usages(coupon_id, phone);
CREATE INDEX IF NOT EXISTS idx_guest_coupon_code   ON guest_coupon_usages(coupon_code);

ALTER TABLE guest_coupon_usages ENABLE ROW LEVEL SECURITY;

-- Service role manages all guest usage records
CREATE POLICY "Service role manages guest coupon usages"
ON guest_coupon_usages FOR ALL
USING (auth.role() = 'service_role');

-- Helper function: check if guest (by email or phone) has used a coupon
CREATE OR REPLACE FUNCTION public.guest_has_used_coupon(
  p_coupon_code TEXT,
  p_email       TEXT DEFAULT NULL,
  p_phone       TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM guest_coupon_usages
    WHERE coupon_code = p_coupon_code
      AND (
        (p_email IS NOT NULL AND email = p_email)
        OR
        (p_phone IS NOT NULL AND phone = p_phone)
      )
  );
$$;
