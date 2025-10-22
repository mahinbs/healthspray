-- Create featured_products table for hero section
-- This table manages up to 5 featured products that can be displayed in the hero section

CREATE TABLE public.featured_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    order_index INT NOT NULL CHECK (order_index >= 1 AND order_index <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure only one product per order position
    CONSTRAINT unique_featured_product_order UNIQUE (order_index),
    -- Ensure a product can only be featured once
    CONSTRAINT unique_featured_product UNIQUE (product_id)
);

-- Set up Row Level Security (RLS) for featured_products
ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to featured products
CREATE POLICY "Allow public read access to featured products"
ON public.featured_products FOR SELECT
USING (is_active = TRUE);

-- Allow admins to manage featured products
CREATE POLICY "Admins can manage featured products"
ON public.featured_products
FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_featured_products_order ON public.featured_products(order_index);
CREATE INDEX IF NOT EXISTS idx_featured_products_active ON public.featured_products(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON public.featured_products(product_id);
