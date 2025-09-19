-- Fix recursive RLS causing 500 on admin_users by using security definer function
-- and allow users to read their own admin record

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop problematic existing policies
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Safer replacement policies
-- Allow authenticated users to view their own admin record, or any record if they are admin
CREATE POLICY "Users can view their admin record or admins can view all"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR is_admin()
);

-- Only admins can insert
CREATE POLICY "Admins can insert admin users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Only admins can update
CREATE POLICY "Admins can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete
CREATE POLICY "Admins can delete admin users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (is_admin());

-- Add idempotency_key column to orders table
ALTER TABLE public.orders 
ADD COLUMN idempotency_key TEXT UNIQUE;

-- Create index for better performance
CREATE INDEX idx_orders_idempotency_key ON public.orders(idempotency_key);

-- Add comment for documentation
COMMENT ON COLUMN public.orders.idempotency_key IS 'Unique key to prevent duplicate orders';