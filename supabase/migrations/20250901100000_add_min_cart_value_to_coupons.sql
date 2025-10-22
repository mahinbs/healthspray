-- Add min_cart_value column to coupons table
ALTER TABLE public.coupons
ADD COLUMN min_cart_value NUMERIC(10, 2) DEFAULT 0;

-- Add index for better performance on min_cart_value queries
CREATE INDEX IF NOT EXISTS idx_coupons_min_cart_value ON public.coupons(min_cart_value);

-- Update existing coupons to have min_cart_value = 0 (no minimum)
UPDATE public.coupons 
SET min_cart_value = 0 
WHERE min_cart_value IS NULL;
