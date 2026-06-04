-- Return & refund tracking for ICICI orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS return_reason TEXT,
  ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_amount INTEGER,
  ADD COLUMN IF NOT EXISTS icici_refund_ref TEXT,
  ADD COLUMN IF NOT EXISTS refund_notes TEXT;

COMMENT ON COLUMN public.orders.refund_amount IS 'Refund amount in paise (same as amount column)';
