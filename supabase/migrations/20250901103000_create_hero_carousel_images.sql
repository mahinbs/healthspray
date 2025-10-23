-- Create hero_carousel_images table for multiple background images
-- This table manages up to 4 background images for the hero section carousel

CREATE TABLE public.hero_carousel_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    video_url TEXT, -- Optional video for each slide
    title TEXT, -- Optional title overlay for this slide
    subtitle TEXT, -- Optional subtitle overlay for this slide
    display_order INT NOT NULL CHECK (display_order >= 1 AND display_order <= 4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure only one image per order position
    CONSTRAINT unique_carousel_order UNIQUE (display_order)
);

-- Set up Row Level Security (RLS) for hero_carousel_images
ALTER TABLE public.hero_carousel_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active carousel images
CREATE POLICY "Allow public read access to active carousel images"
ON public.hero_carousel_images FOR SELECT
USING (is_active = TRUE);

-- Allow admins to manage carousel images
CREATE POLICY "Admins can manage carousel images"
ON public.hero_carousel_images
FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carousel_order ON public.hero_carousel_images(display_order);
CREATE INDEX IF NOT EXISTS idx_carousel_active ON public.hero_carousel_images(is_active);

-- Insert default carousel images (you can replace these URLs with your actual images)
INSERT INTO public.hero_carousel_images (
    image_url,
    video_url,
    title,
    subtitle,
    display_order,
    is_active
) VALUES 
(
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop',
    NULL,
    'Relieve Pain. Recover Faster. Rise Stronger.',
    'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.',
    1,
    TRUE
),
(
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop',
    NULL,
    'Relieve Pain. Recover Faster. Rise Stronger.',
    'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.',
    2,
    TRUE
),
(
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop',
    NULL,
    'Relieve Pain. Recover Faster. Rise Stronger.',
    'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.',
    3,
    TRUE
),
(
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop',
    NULL,
    'Relieve Pain. Recover Faster. Rise Stronger.',
    'Scientifically designed pain relief and recovery solutions to keep you moving — before, during, and after every workout.',
    4,
    TRUE
);
