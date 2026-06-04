-- Payment gateway fees and full checkout breakdown on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS service_charge numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paid numeric,
  ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_sub_inst_type text;

COMMENT ON COLUMN public.orders.amount IS 'Merchant settlement in paise (products after discount + shipping)';
COMMENT ON COLUMN public.orders.coupon_discount IS 'Coupon discount in rupees';
COMMENT ON COLUMN public.orders.shipping_fee IS 'Delivery charge in rupees';
COMMENT ON COLUMN public.orders.service_charge IS 'ICICI gateway convenience fee in rupees';
COMMENT ON COLUMN public.orders.total_paid IS 'Total charged to customer in rupees (merchant + service charge)';
