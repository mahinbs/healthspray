-- Add video fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS has_video BOOLEAN DEFAULT false;

-- Create index for video-enabled products
CREATE INDEX IF NOT EXISTS idx_products_has_video ON public.products(has_video);

-- Update existing products to have has_video = false by default
UPDATE public.products SET has_video = false WHERE has_video IS NULL;

-- Create a function to automatically update has_video based on video_url
CREATE OR REPLACE FUNCTION update_has_video()
RETURNS TRIGGER AS $$
BEGIN
    NEW.has_video = (NEW.video_url IS NOT NULL AND NEW.video_url != '');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update has_video
DROP TRIGGER IF EXISTS update_has_video_trigger ON public.products;
CREATE TRIGGER update_has_video_trigger
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_has_video();

-- Add RLS policy for video access (public read access to video URLs)
CREATE POLICY "Allow public read access to video URLs" ON public.products
    FOR SELECT USING (true);
