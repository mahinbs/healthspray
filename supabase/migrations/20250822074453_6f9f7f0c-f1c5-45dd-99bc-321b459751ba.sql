-- Create admin_users table for secure admin authentication
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_users au 
  WHERE au.user_id = auth.uid() AND au.is_active = true
));

CREATE POLICY "Admins can manage admin users" 
ON public.admin_users 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users au 
  WHERE au.user_id = auth.uid() AND au.is_active = true
));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = $1 AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update orders policies to use admin function
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
CREATE POLICY "Admin full access to orders" 
ON public.orders 
FOR ALL
USING (public.is_admin());

-- Create trigger for admin_users timestamps
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Insert initial admin user (you'll need to replace this with actual user_id after registration)
-- This is just a placeholder - the actual admin user will be created after they register
-- INSERT INTO public.admin_users (user_id, role, permissions) 
-- VALUES ('your-user-id-here', 'admin', '["manage_products", "manage_orders", "manage_users"]');