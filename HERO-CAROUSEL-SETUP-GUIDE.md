# Hero Carousel Setup Guide

This guide explains how to set up and manage the hero section carousel with up to 4 background images.

## 1. Database Setup

Run the migration to create the `hero_carousel_images` table:

```bash
supabase db push
```

This will create:
- `hero_carousel_images` table with support for up to 4 images
- Each image can have custom title/subtitle overlays
- Optional video support for each slide
- Display order management (1-4)

## 2. Admin Panel Usage

### Accessing Hero Carousel Manager
1. Go to your admin panel
2. Click on the "Featured" tab
3. You'll see three sections:
   - **Hero Carousel Images** (top)
   - **Hero Section Content** (middle) 
   - **Featured Products** (bottom)

### Adding Carousel Images
1. Click "Add Carousel Image" button
2. Fill in the required fields:
   - **Image URL**: Upload to Supabase Storage `product-images/hero-section/` folder
   - **Display Order**: Choose position 1-4
   - **Title/Subtitle**: Optional overlay text for this slide
   - **Video URL**: Optional video for this slide
   - **Active**: Toggle to show/hide this slide

### Managing Images
- **Edit**: Click the edit icon to modify an image
- **Activate/Deactivate**: Click the eye icon to toggle visibility
- **Remove**: Click the trash icon to delete an image
- **Reorder**: Change the display order to rearrange slides

## 3. Image Upload Process

### Option 1: Direct URL (Recommended)
1. Upload images to Supabase Storage:
   - Go to Supabase Dashboard → Storage
   - Navigate to `product-images` bucket
   - Create `hero-section` folder if it doesn't exist
   - Upload your images (recommended: 1920x1080px)
2. Copy the public URL from Supabase Storage
3. Paste the URL in the admin panel

### Option 2: External URLs
- Use any publicly accessible image URL
- Ensure images are optimized for web (under 500KB)

## 4. Frontend Behavior

### Carousel Features
- **Auto-advance**: Slides change every 5 seconds
- **Manual Navigation**: Arrow buttons and dot indicators
- **Responsive**: Works on all screen sizes
- **Fallback**: Shows gradient background if no images are configured

### Conditional Rendering
- **Featured Products**: Only shows if products are added via admin panel
- **Carousel**: Only shows if carousel images are added and active
- **Hero Content**: Uses dynamic content from `hero_section` table

## 5. Best Practices

### Image Guidelines
- **Resolution**: 1920x1080px or higher
- **Format**: WebP or optimized JPEG
- **File Size**: Under 500KB for fast loading
- **Content**: High-quality product shots or lifestyle images

### Content Guidelines
- **Titles**: Keep under 60 characters
- **Subtitles**: Keep under 120 characters
- **Order**: Most important content in position 1

## 6. Troubleshooting

### Images Not Showing
1. Check if images are marked as "Active" in admin panel
2. Verify image URLs are publicly accessible
3. Check browser console for loading errors

### Carousel Not Working
1. Ensure at least one image is added and active
2. Check if `hero_carousel_images` table exists
3. Verify RLS policies are set correctly

### Featured Products Not Showing
1. Add products via "Featured Products" section in admin panel
2. Ensure products are marked as "Active"
3. Check if products exist in the `products` table

## 7. Database Schema

```sql
-- hero_carousel_images table structure
CREATE TABLE public.hero_carousel_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    video_url TEXT,
    title TEXT,
    subtitle TEXT,
    display_order INT NOT NULL CHECK (display_order >= 1 AND display_order <= 4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_carousel_order UNIQUE (display_order)
);
```

This system provides complete control over your hero section with professional carousel functionality!
