-- Create hero_section table for hero section content
-- This table manages the actual hero section content like headlines, descriptions, background images

CREATE TABLE public.hero_section (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type TEXT NOT NULL CHECK (section_type IN ('main_hero', 'featured_products', 'stats', 'cta')),
    title TEXT,
    subtitle TEXT,
    description TEXT,
    background_image_url TEXT,
    background_video_url TEXT,
    cta_primary_text TEXT DEFAULT 'Shop Now',
    cta_primary_url TEXT DEFAULT '/shop',
    cta_secondary_text TEXT DEFAULT 'Explore Regimens',
    cta_secondary_url TEXT DEFAULT '/regimens',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure only one active hero section per type
    CONSTRAINT unique_active_hero_section UNIQUE (section_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Set up Row Level Security (RLS) for hero_section
ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active hero sections
CREATE POLICY "Allow public read access to active hero sections"
ON public.hero_section FOR SELECT
USING (is_active = TRUE);

-- Allow admins to manage hero sections
CREATE POLICY "Admins can manage hero sections"
ON public.hero_section
FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hero_section_type ON public.hero_section(section_type);
CREATE INDEX IF NOT EXISTS idx_hero_section_active ON public.hero_section(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_section_order ON public.hero_section(display_order);

-- Insert default hero section content
INSERT INTO public.hero_section (
    section_type,
    title,
    subtitle,
    description,
    cta_primary_text,
    cta_primary_url,
    cta_secondary_text,
    cta_secondary_url,
    is_active,
    display_order
) VALUES (
    'main_hero',
    'Relieve Pain. Recover Faster. Rise Stronger.',
    'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.',
    'Professional-grade solutions for peak performance',
    'Shop Now',
    '/shop',
    'Explore Regimens',
    '/regimens',
    TRUE,
    1
);