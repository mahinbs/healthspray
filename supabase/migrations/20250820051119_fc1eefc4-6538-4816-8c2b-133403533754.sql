
-- 1) Ensure UUID generation is available
create extension if not exists "pgcrypto";

-- 2) Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  original_price integer,
  image text,
  category text not null,
  description text,
  features text[] not null default '{}'::text[],
  rating integer not null default 0,
  reviews integer not null default 0,
  is_new boolean not null default false,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Trigger to keep updated_at in sync
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.products;
create trigger set_timestamp
before update on public.products
for each row execute function public.trigger_set_timestamp();

-- 4) Helpful indexes
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_is_new_idx on public.products (is_new);
create index if not exists products_category_idx on public.products (category);

-- 5) Enable RLS and add temporary permissive policies
alter table public.products enable row level security;

drop policy if exists "Public read access" on public.products;
create policy "Public read access"
on public.products for select
using (true);

drop policy if exists "Public insert access (temporary)" on public.products;
create policy "Public insert access (temporary)"
on public.products for insert
with check (true);

drop policy if exists "Public update access (temporary)" on public.products;
create policy "Public update access (temporary)"
on public.products for update
using (true);

drop policy if exists "Public delete access (temporary)" on public.products;
create policy "Public delete access (temporary)"
on public.products for delete
using (true);
