-- Database setup script for Zippty
-- Run this in your Supabase SQL editor

-- Add idempotency_key column to orders table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'idempotency_key'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN idempotency_key TEXT UNIQUE;
        CREATE INDEX idx_orders_idempotency_key ON public.orders(idempotency_key);
        COMMENT ON COLUMN public.orders.idempotency_key IS 'Unique key to prevent duplicate orders';
    END IF;
END $$;

-- Verify the orders table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
