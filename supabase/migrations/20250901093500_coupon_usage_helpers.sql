-- Helper function to increment coupons.total_usage by code
create or replace function public.increment_coupon_total_usage(code text)
returns void
language sql
as $$
  update public.coupons
  set total_usage = coalesce(total_usage, 0) + 1
  where coupons.code = code;
$$;


