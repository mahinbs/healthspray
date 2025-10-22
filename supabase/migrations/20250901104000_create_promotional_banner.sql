-- Create promotional banner table
CREATE TABLE public.promotional_banner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    text_color TEXT DEFAULT '#FFFFFF',
    background_color TEXT DEFAULT '#FF6B35',
    is_active BOOLEAN DEFAULT TRUE,
    animation_speed INTEGER DEFAULT 50, -- pixels per second
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_banner ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active promotional banner"
ON public.promotional_banner FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admins can manage promotional banner"
ON public.promotional_banner
FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotional_banner_active ON public.promotional_banner(is_active);

-- Insert default promotional banner
INSERT INTO public.promotional_banner (
    text,
    text_color,
    background_color,
    is_active,
    animation_speed
) VALUES (
    '🎉 Special Offer: Get 20% off on all pain relief products! Use code PAIN20 at checkout. Limited time offer!',
    '#FFFFFF',
    '#FF6B35',
    TRUE,
    50
);
