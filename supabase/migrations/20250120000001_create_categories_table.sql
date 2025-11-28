-- Create categories table for managing shop by category section
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  background_image_url TEXT,
  gradient_from TEXT,
  gradient_to TEXT,
  product_tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for active categories
CREATE POLICY "Public read access for active categories" ON public.categories
  FOR SELECT USING (is_active = true);

-- Admin full access (placeholder - replace with proper admin check)
CREATE POLICY "Admin full access to categories" ON public.categories
  FOR ALL USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Insert default categories based on existing data with Supabase storage bucket image URLs
-- Images are stored in Supabase storage bucket 'product-images' or similar
-- Update these URLs with your actual Supabase storage bucket URLs
INSERT INTO public.categories (name, description, slug, background_image_url, gradient_from, gradient_to, product_tags, display_order, is_active)
VALUES
  ('Warm-Up & Cool-Down', 'Pre and post workout solutions', 'warmup-cooldown', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/warmup-cooldown-bg.jpg', 'orange-500', 'red-600', ARRAY['Thermo Gel', 'Cryo Gel', 'Recovery Tools'], 1, true),
  ('Strain & Pain Relief', 'Instant relief solutions', 'strain-pain-relief', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/pain-relief-bg.webp', 'yellow-500', 'orange-600', ARRAY['Cryo Spray', 'Pain Relief Gel', 'Recovery Balms'], 2, true),
  ('Performance Essentials', 'Gear to boost every session', 'performance-essentials', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/compression-wear-bg.jpg', 'blue-500', 'purple-600', ARRAY['Compression Sleeves', 'Recovery Shirts', 'Support Gear'], 3, true),
  ('Active Body Care Rang', 'Daily care for active lifestyles', 'active-body-care', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/stiff-before-workout-bg.jpg', 'teal-500', 'emerald-600', ARRAY['Body Wash', 'Muscle Balm', 'Care Kits'], 4, true)
ON CONFLICT (slug) DO NOTHING;
