-- Create admin access policy for orders (allow full access to orders table for admin operations)
CREATE POLICY "Admin full access to orders" 
ON public.orders 
FOR ALL
USING (true);