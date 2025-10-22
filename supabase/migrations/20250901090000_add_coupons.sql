-- Coupons core tables
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percentage','fixed')),
  value numeric not null check (value > 0),
  max_discount numeric, -- optional cap for percentage
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  usage_limit_per_user int not null default 1,
  total_usage int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- Track per-user coupon usage
create table if not exists public.coupon_usages (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null,
  order_id uuid not null,
  used_at timestamptz not null default now()
);

-- Minimal indexes
create index if not exists idx_coupons_code on public.coupons (code);
create index if not exists idx_coupon_usages_coupon_user on public.coupon_usages (coupon_id, user_id);

-- Orders add coupon columns
alter table if exists public.orders
  add column if not exists coupon_code text,
  add column if not exists coupon_type text check (coupon_type in ('percentage','fixed')),
  add column if not exists coupon_value numeric,
  add column if not exists coupon_discount numeric;

-- RLS policies (read for all; write by service/edge only)
alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;

do $$ begin
  create policy "Coupons are readable" on public.coupons for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Coupon usages by owner" on public.coupon_usages for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


