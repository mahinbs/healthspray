# 🎥 Product Video Management System Setup Guide

This guide will help you set up the complete video management system for your Physiq e-commerce platform, allowing admins to upload product videos that will be displayed in the Shop by Video section.

## 📋 Prerequisites

- Supabase project with admin access
- Supabase CLI installed
- Admin panel access to your Physiq platform

## 🗄️ Database Setup

### 1. Run the Migration

Execute the migration file to add video fields to your products table:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/20250125000000_add_video_fields.sql

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
```

## 🪣 Supabase Storage Setup

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create Bucket**
4. Configure the bucket:
   - **Name**: `product-videos`
   - **Public**: ✅ **Yes** (videos need to be publicly accessible)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: 
     - `video/mp4`
     - `video/webm`
     - `video/ogg`
     - `video/avi`
     - `video/mov`
     - `image/jpeg`
     - `image/png`
     - `image/webp`

### 2. Set Storage Policies

Add these RLS policies for the `product-videos` bucket:

```sql
-- Allow public read access to videos
CREATE POLICY "Public read access for videos" ON storage.objects
FOR SELECT USING (bucket_id = 'product-videos');

-- Allow authenticated users to upload videos (admin only)
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-videos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update videos (admin only)
CREATE POLICY "Authenticated users can update videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-videos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete videos (admin only)
CREATE POLICY "Authenticated users can delete videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-videos' 
  AND auth.role() = 'authenticated'
);
```

## 🔧 Edge Function Setup

### 1. Deploy the Video Upload Function

```bash
# Navigate to your project directory
cd /Users/animesh/Documents/BoostMySites/healthspray

# Deploy the upload-product-video function
supabase functions deploy upload-product-video
```

### 2. Set Environment Variables

Set the required environment variables in your Supabase project:

```bash
# Set Razorpay credentials (if not already set)
supabase secrets set RAZORPAY_KEY_ID=your_razorpay_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Set Supabase credentials (if not already set)
supabase secrets set SUPABASE_URL=https://gielqkfnsypadbplaaci.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWxxa2Zuc3lwYWRicGxhYWNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MzIwNCwiZXhwIjoyMDczODQ5MjA0fQ.VfVS__UtI-8xWRYpzJBZSkY1rW_SIPPDk1tjf0nib5Q
```

## 🎨 Frontend Integration

### 1. Updated Components

The following components have been updated:

- **Admin Panel**: Added "Videos" tab with video management interface
- **ShopByVideo Component**: Now fetches videos dynamically from database
- **VideoManagement Component**: New component for admin video management
- **Products Service**: Added `getProductsWithVideos()` method

### 2. Type Definitions

The Supabase types have been updated to include:
- `video_url: string | null`
- `video_thumbnail: string | null`
- `has_video: boolean`

## 🚀 How to Use

### For Admins

1. **Access Video Management**:
   - Login to admin panel
   - Click on "Videos" tab
   - View products with/without videos

2. **Upload Product Video**:
   - Click "Upload Video" button
   - Select a product from the dropdown
   - Choose video file (MP4, WebM, OGG, AVI, MOV - max 50MB)
   - Optionally upload thumbnail image (JPEG, PNG, WebP - max 5MB)
   - Click "Upload Video"

3. **Manage Existing Videos**:
   - View all products with videos
   - Click "View Video" to preview
   - Click trash icon to remove video

### For Users

1. **Shop by Video Section**:
   - Videos automatically appear in the Shop by Video section
   - Only products with uploaded videos are shown
   - Click on video thumbnail to play in modal
   - Add products to cart directly from video section

## 📱 Video Specifications

### Supported Formats
- **Video**: MP4, WebM, OGG, AVI, MOV
- **Thumbnail**: JPEG, PNG, WebP

### File Size Limits
- **Video**: Maximum 50MB
- **Thumbnail**: Maximum 5MB

### Recommended Settings
- **Resolution**: 1080p or 720p
- **Aspect Ratio**: 3:4 (portrait) or 16:9 (landscape)
- **Duration**: 30-60 seconds for best engagement
- **Format**: MP4 with H.264 encoding

## 🔒 Security Features

1. **Authentication Required**: Only authenticated admin users can upload videos
2. **File Type Validation**: Only allowed video/image formats accepted
3. **File Size Limits**: Prevents large file uploads
4. **RLS Policies**: Proper access control for storage bucket
5. **Input Validation**: Server-side validation of all inputs

## 🐛 Troubleshooting

### Common Issues

1. **Video Not Uploading**:
   - Check file size (must be under 50MB)
   - Verify file format is supported
   - Ensure admin authentication

2. **Video Not Displaying**:
   - Check if `has_video` is true in database
   - Verify `video_url` is not null
   - Check Supabase Storage bucket permissions

3. **Edge Function Errors**:
   - Verify environment variables are set
   - Check Supabase logs for detailed errors
   - Ensure storage bucket exists and is public

### Debug Steps

1. **Check Database**:
   ```sql
   SELECT id, name, has_video, video_url FROM products WHERE has_video = true;
   ```

2. **Check Storage**:
   - Go to Supabase Dashboard > Storage
   - Verify `product-videos` bucket exists
   - Check if files are uploaded

3. **Check Edge Function Logs**:
   - Go to Supabase Dashboard > Edge Functions
   - Click on `upload-product-video`
   - View logs for any errors

## 📊 Analytics

The video management system includes:

- **Total Products**: Count of all products
- **With Videos**: Count of products that have videos
- **Without Videos**: Count of products missing videos
- **Upload Progress**: Real-time upload progress
- **Error Tracking**: Comprehensive error logging

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Storage Usage**: Check Supabase Storage usage
2. **Clean Up Old Videos**: Remove unused video files
3. **Update Video Quality**: Replace low-quality videos
4. **Backup Important Videos**: Download critical product videos

### Performance Optimization

1. **Video Compression**: Use tools like HandBrake to compress videos
2. **CDN Integration**: Consider using Supabase CDN for faster delivery
3. **Lazy Loading**: Videos load only when needed
4. **Caching**: Browser caching for video files

## 🎯 Best Practices

1. **Video Content**:
   - Show products in action
   - Keep videos short and engaging
   - Use good lighting and clear audio
   - Include product benefits and features

2. **File Management**:
   - Use descriptive filenames
   - Compress videos before upload
   - Create custom thumbnails for better previews
   - Test videos on different devices

3. **User Experience**:
   - Ensure videos load quickly
   - Provide fallback for slow connections
   - Make videos accessible (subtitles if needed)
   - Optimize for mobile viewing

---

## ✅ Setup Checklist

- [ ] Database migration executed
- [ ] Storage bucket created (`product-videos`)
- [ ] Storage policies configured
- [ ] Edge function deployed
- [ ] Environment variables set
- [ ] Admin panel updated
- [ ] Frontend components updated
- [ ] Test video upload
- [ ] Verify video display in Shop by Video section

Once all steps are completed, your video management system will be fully functional! Admins can upload product videos that will automatically appear in the Shop by Video section for customers to view and purchase products.
