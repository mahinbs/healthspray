-- Create product_video_interactions table for tracking video engagement
CREATE TABLE IF NOT EXISTS public.product_video_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_video_interactions_product_id ON public.product_video_interactions(product_id);

-- Enable RLS
ALTER TABLE public.product_video_interactions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for video interactions" ON public.product_video_interactions
  FOR SELECT USING (true);

-- Public insert/update access (for incrementing counts)
CREATE POLICY "Public insert/update access for video interactions" ON public.product_video_interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access for video interactions" ON public.product_video_interactions
  FOR UPDATE USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_video_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_interactions_updated_at
  BEFORE UPDATE ON public.product_video_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_video_interactions_updated_at();

-- Initialize interactions for existing products with videos
INSERT INTO public.product_video_interactions (product_id, views_count, likes_count, shares_count)
SELECT id, 0, 0, 0
FROM public.products
WHERE video_url IS NOT NULL AND video_url != ''
ON CONFLICT (product_id) DO NOTHING;
