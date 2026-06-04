-- Paste into Supabase Dashboard → SQL Editor → Run (project: pwlonviycrvejqbhlyaj)
-- Creates categories + blog_posts. REQUIRED for admin Blog/Categories tabs.

-- === categories (from 20250120000001_create_categories_table.sql) ===
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

CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for active categories" ON public.categories;
CREATE POLICY "Public read access for active categories" ON public.categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to categories" ON public.categories;
CREATE POLICY "Admin full access to categories" ON public.categories
  FOR ALL USING (true);

CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

INSERT INTO public.categories (name, description, slug, background_image_url, gradient_from, gradient_to, product_tags, display_order, is_active)
VALUES
  ('Warm-Up & Cool-Down', 'Pre and post workout solutions', 'warmup-cooldown', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/warmup-cooldown-bg.jpg', 'orange-500', 'red-600', ARRAY['Thermo Gel', 'Cryo Gel', 'Recovery Tools'], 1, true),
  ('Strain & Pain Relief', 'Instant relief solutions', 'strain-pain-relief', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/pain-relief-bg.webp', 'yellow-500', 'orange-600', ARRAY['Cryo Spray', 'Pain Relief Gel', 'Recovery Balms'], 2, true),
  ('Performance Essentials', 'Gear to boost every session', 'performance-essentials', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/compression-wear-bg.jpg', 'blue-500', 'purple-600', ARRAY['Compression Sleeves', 'Recovery Shirts', 'Support Gear'], 3, true),
  ('Active Body Care Rang', 'Daily care for active lifestyles', 'active-body-care', 'https://tdzyskyjqobglueymvmx.supabase.co/storage/v1/object/public/product-images/stiff-before-workout-bg.jpg', 'teal-500', 'emerald-600', ARRAY['Body Wash', 'Muscle Balm', 'Care Kits'], 4, true)
ON CONFLICT (slug) DO NOTHING;

-- === blog_posts (from 20250120000002_create_blog_posts_table.sql) ===
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date DATE NOT NULL,
  image_url TEXT NOT NULL,
  category_tag TEXT NOT NULL,
  read_time_minutes INTEGER DEFAULT 5,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  detailed_title TEXT,
  detailed_content JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_is_active ON public.blog_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_posts_display_order ON public.blog_posts(display_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON public.blog_posts(published_date DESC);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for active blog posts" ON public.blog_posts;
CREATE POLICY "Public read access for active blog posts" ON public.blog_posts
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to blog posts" ON public.blog_posts;
CREATE POLICY "Admin full access to blog posts" ON public.blog_posts
  FOR ALL USING (true);

CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

INSERT INTO public.blog_posts (title, description, author, published_date, image_url, category_tag, read_time_minutes, slug, detailed_title, detailed_content, display_order, is_active)
VALUES
  ('Active vs. Passive Recovery: Which One Is Better for You?', 'The right recovery method can make all the difference in your athletic performance.', 'Sandhya Seshadri', '2025-03-11', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&crop=center', 'Recovery', 5, 'active-vs-passive-recovery', 'Active vs. Passive Recovery: Which One Is Better for You?', '[{"type":"heading","content":"Understanding Recovery Methods","level":2}]'::jsonb, 1, true),
  ('Epsom Salt: The Secret Weapon for Athlete Recovery', 'Discover the power of Epsom salt.', 'Heena Baig', '2024-11-06', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop&crop=center', 'Recovery', 7, 'epsom-salt-secret-weapon-athlete-recovery', 'Epsom Salt: The Secret Weapon for Athlete Recovery', '[{"type":"heading","content":"Introduction to Epsom Salt","level":2}]'::jsonb, 2, true),
  ('Dynamic Duo of Active and Passive Recovery', 'Learn the perfect balance between active and passive recovery.', 'Heena Baig', '2023-12-13', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop&crop=center', 'Training', 6, 'dynamic-duo-active-passive-recovery', 'Dynamic Duo of Active and Passive Recovery', '[{"type":"heading","content":"The Perfect Balance","level":2}]'::jsonb, 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed main hero text if missing (homepage Hero Section Content)
INSERT INTO public.hero_section (
  section_type, title, subtitle, description,
  cta_primary_text, cta_primary_url, is_active, display_order
)
SELECT
  'main_hero',
  'Relieve Pain. Recover Faster. Rise Stronger.',
  'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.',
  'Professional-grade solutions for peak performance',
  'Shop Now',
  '/shop',
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM public.hero_section WHERE section_type = 'main_hero'
);
