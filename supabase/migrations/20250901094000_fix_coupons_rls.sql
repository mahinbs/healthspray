-- Fix RLS policies for coupons table to allow admin users to create/update/delete coupons

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Coupons are readable" ON public.coupons;
DROP POLICY IF EXISTS "Coupon usages by owner" ON public.coupon_usages;

-- Create new policies for coupons table
CREATE POLICY "Coupons are readable by all" ON public.coupons 
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage coupons" ON public.coupons 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create policies for coupon_usages table
CREATE POLICY "Users can read their own coupon usages" ON public.coupon_usages 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin users can manage coupon usages" ON public.coupon_usages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Allow service role to manage coupon usages (for payment verification)
CREATE POLICY "Service role can manage coupon usages" ON public.coupon_usages 
  FOR ALL USING (true);
