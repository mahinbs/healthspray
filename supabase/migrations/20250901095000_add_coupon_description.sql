-- Add description field to coupons table
ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure is_active column exists and has proper default
ALTER TABLE public.coupons 
ALTER COLUMN is_active SET DEFAULT true;

-- Add index for better performance when filtering active coupons
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (is_active) WHERE is_active = true;
