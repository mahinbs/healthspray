-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create RLS policies for product images bucket
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload access for product images" 
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin update access for product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Admin delete access for product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'product-images');