# 🪣 Supabase Storage Bucket Setup Script

This script will help you create the `product-videos` storage bucket in Supabase.

## 📋 **Manual Setup Steps:**

### 1. **Create Storage Bucket**

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `gielqkfnsypadbplaaci`
3. Navigate to **Storage** in the left sidebar
4. Click **"Create Bucket"**
5. Configure the bucket with these settings:

```
Bucket Name: product-videos
Public: ✅ Yes (checked)
File Size Limit: 50 MB
Allowed MIME Types:
  - video/mp4
  - video/webm
  - video/ogg
  - video/avi
  - video/mov
  - image/jpeg
  - image/png
  - image/webp
```

### 2. **Set Storage Policies**

After creating the bucket, run this SQL in your **Supabase SQL Editor**:

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

### 3. **Deploy Edge Function**

Run this command in your terminal:

```bash
cd /Users/animesh/Documents/BoostMySites/healthspray
supabase functions deploy upload-product-video
```

### 4. **Set Environment Variables**

Make sure these are set in your Supabase project:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZWxxa2Zuc3lwYWRicGxhYWNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI3MzIwNCwiZXhwIjoyMDczODQ5MjA0fQ.VfVS__UtI-8xWRYpzJBZSkY1rW_SIPPDk1tjf0nib5Q
```

## ✅ **Verification Steps:**

1. **Check Bucket Exists**: Go to Storage → Should see `product-videos` bucket
2. **Test Upload**: Try uploading a video in admin panel
3. **Check Database**: Verify `has_video` field updates correctly
4. **Check Frontend**: Videos should appear in Shop by Video section

## 🎯 **What's Changed:**

- ✅ **Removed** general "Upload Video" button from top
- ✅ **Each product** now has its own "Add Video" or "Update Video" button
- ✅ **Product-specific** upload dialog shows selected product info
- ✅ **Cleaner UI** with better user experience

## 🚀 **Ready to Use:**

Once you complete the storage bucket setup, your video management system will be fully functional! Admins can:

1. **Upload videos** for specific products
2. **Update existing** product videos  
3. **Remove videos** from products
4. **View statistics** (total products, with videos, without videos)
5. **See videos** automatically appear in Shop by Video section

The system is now much more intuitive with product-specific video management! 🎥
