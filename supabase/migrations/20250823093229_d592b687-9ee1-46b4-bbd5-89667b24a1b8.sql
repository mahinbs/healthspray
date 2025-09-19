-- Drop the conditional unique index and create a proper unique constraint
-- that works with Supabase's upsert method
DROP INDEX IF EXISTS orders_idempotency_key_unique;

-- Create a unique constraint on idempotency_key for non-null values
-- We'll handle this by creating a unique constraint that allows nulls
-- but ensures uniqueness when values are present
CREATE UNIQUE INDEX orders_idempotency_key_unique_not_null
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;