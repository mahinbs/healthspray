# Hero Section Storage Setup Guide

## Overview
This guide explains how to set up the `hero-section` folder in the Supabase Storage bucket for storing hero section images.

## Storage Bucket Setup

### 1. Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. You should see the `product-images` bucket (or create it if it doesn't exist)

### 2. Create hero-section Folder
1. Click on the `product-images` bucket
2. Click **"New folder"** button
3. Name the folder: `hero-section`
4. Click **"Create folder"**

### 3. Set Folder Permissions
The `hero-section` folder will inherit the same permissions as the `product-images` bucket. Since the bucket is already configured for public read access, the folder will also be publicly accessible.

## Usage

### For Featured Products
When admins add featured products through the admin panel, they can:

1. **Use Default Product Images**: The system will automatically use the product's existing images
2. **Upload Custom Hero Images**: Admins can provide custom image URLs for the hero section display
3. **Store in hero-section Folder**: Custom hero images should be uploaded to the `hero-section` folder

### Image Guidelines
- **Recommended Size**: 400x300px or similar aspect ratio
- **Format**: JPG, PNG, or WebP
- **File Size**: Keep under 500KB for optimal loading
- **Naming Convention**: Use descriptive names like `product-name-hero.jpg`

### Example URLs
After uploading images to the `hero-section` folder, the URLs will look like:
```
https://gielqkfnsypadbplaaci.supabase.co/storage/v1/object/public/product-images/hero-section/product-name-hero.jpg
```

## Admin Panel Usage

### Adding Featured Products
1. Go to **Admin Panel** → **Featured** tab
2. Click **"Add Featured Product"**
3. Select a product from the dropdown
4. Choose order position (1-5)
5. Optionally add:
   - Custom hero image URL (pointing to `hero-section` folder)
   - Custom hero title
   - Custom hero description
6. Set as active/inactive
7. Click **"Add Featured Product"**

### Managing Featured Products
- **Maximum**: 5 featured products
- **Order**: Products are displayed in order (1-5)
- **Customization**: Each featured product can have custom hero content
- **Activation**: Products can be activated/deactivated without removing them

## Frontend Display

The hero section will automatically display featured products when:
- Products are marked as `is_active = true`
- Products are ordered by `order_index` (1-5)
- Maximum 5 products are shown

The display includes:
- Product image (custom hero image or default product image)
- Custom title or product name
- Custom description or product description
- Product rating and price
- "Add to Cart" button

## Troubleshooting

### Images Not Loading
1. Check if the image URL is correct
2. Verify the image is uploaded to the `hero-section` folder
3. Ensure the bucket has public read access
4. Check if the image file exists and is accessible

### Featured Products Not Showing
1. Verify products are marked as `is_active = true`
2. Check if `order_index` is set (1-5)
3. Ensure products are properly linked in the `featured_products` table
4. Check browser console for any errors

### Admin Panel Issues
1. Ensure you're logged in as an admin user
2. Check if the `featured_products` table exists
3. Verify RLS policies are correctly set
4. Check Supabase logs for any errors

## Database Schema

The `featured_products` table includes:
- `id`: UUID primary key
- `product_id`: Reference to products table
- `order_index`: Display order (1-5)
- `hero_image_url`: Optional custom image URL
- `hero_title`: Optional custom title
- `hero_description`: Optional custom description
- `is_active`: Boolean for activation status
- `created_at` / `updated_at`: Timestamps

## Security Notes

- The `hero-section` folder is publicly accessible
- Only admin users can manage featured products
- Product selection is limited to active products only
- Maximum 5 featured products enforced at database level
