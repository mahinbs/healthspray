-- Allow guest checkout (orders without logged-in user)
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Guest contact email on order (optional)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
