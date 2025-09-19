-- Add idempotency_key column and unique index to support ON CONFLICT
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Ensure uniqueness only when the key is present to avoid issues with existing rows
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_unique
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;