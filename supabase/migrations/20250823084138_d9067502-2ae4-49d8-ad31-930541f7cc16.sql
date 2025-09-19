-- Add idempotency key column and unique partial index to prevent duplicate orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Unique index only when key is present
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_uidx
ON public.orders (idempotency_key)
WHERE idempotency_key IS NOT NULL;