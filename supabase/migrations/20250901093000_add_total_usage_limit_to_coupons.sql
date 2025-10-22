-- Allow admins to cap total coupon redemptions; NULL means infinite
alter table if exists public.coupons
  add column if not exists total_usage_limit int;

-- Helpful index for querying remaining redemptions
create index if not exists idx_coupons_usage_limits on public.coupons (total_usage, total_usage_limit);


