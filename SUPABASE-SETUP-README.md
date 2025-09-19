# Supabase Integration Setup

This document explains how the Admin panel has been updated to use Supabase for all data operations instead of localStorage.

## Changes Made

### 1. Database Schema
- Created a `products` table in Supabase with proper structure
- Added indexes for better performance
- Enabled Row Level Security (RLS) for data protection
- Added automatic timestamp updates

### 2. New Files Created
- `src/services/products.ts` - Service layer for all product operations
- `src/integrations/supabase/types.ts` - Updated with products table types
- `supabase/migrations/create_products_table.sql` - Database migration script

### 3. Updated Files
- `src/pages/Admin.tsx` - Completely rewritten to use Supabase
- Removed all localStorage dependencies
- Added proper loading states and error handling
- Real-time data fetching from database

## Database Setup

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/create_products_table.sql`
4. Run the script

### Option 2: Using Supabase CLI
1. Install Supabase CLI if you haven't already
2. Run the migration:
   ```bash
   supabase db push
   ```

## Features

### Admin Panel Features
- **Real-time Data**: All products and stats are fetched from Supabase
- **CRUD Operations**: Create, Read, Update, Delete products
- **Loading States**: Proper loading indicators during operations
- **Error Handling**: Graceful error handling with user feedback
- **Auto-initialization**: Automatically creates sample products if database is empty
- **Statistics**: Real-time stats calculated from database

### Product Management
- Add new products with full details
- Edit existing products
- Delete products with confirmation
- Toggle product active/inactive status
- Manage stock levels
- Upload images via URL or file upload
- Manage product features as an array

### Database Features
- **Row Level Security**: Public can only read active products
- **Automatic Timestamps**: Created and updated timestamps
- **Data Validation**: Proper constraints and checks
- **Performance**: Indexed fields for fast queries

## API Endpoints (via Supabase)

The service layer provides these operations:

```typescript
// Get all products (admin)
productsService.getAllProducts()

// Get active products only (public)
productsService.getActiveProducts()

// Add new product
productsService.addProduct(productData)

// Update product
productsService.updateProduct(id, updates)

// Delete product
productsService.deleteProduct(id)

// Get statistics
productsService.getProductStats()

// Initialize sample data
productsService.initializeSampleProducts()
```

## Security

- **Public Access**: Only active products are visible to public users
- **Admin Access**: Full CRUD operations for authenticated admins
- **Data Validation**: Server-side validation through Supabase constraints
- **RLS Policies**: Row Level Security ensures data protection

## Environment Variables

Make sure your Supabase credentials are properly configured in:
- `src/integrations/supabase/client.ts`

## Migration from localStorage

The system automatically handles migration:
1. On first load, it checks if the database is empty
2. If empty, it creates sample products
3. All existing localStorage data should be migrated manually if needed

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase URL and API key
   - Verify network connectivity
   - Check RLS policies

2. **Permission Denied**
   - Ensure RLS policies are correctly configured
   - Check if user has proper permissions

3. **Data Not Loading**
   - Check browser console for errors
   - Verify database table exists
   - Check if sample data was created

### Debug Mode

Enable debug logging by checking browser console for detailed error messages.

## Future Enhancements

- Real-time subscriptions for live updates
- Image upload to Supabase Storage
- Advanced filtering and search
- Bulk operations
- Export/import functionality
- Audit logging
- User management system

## Support

For issues related to:
- **Supabase Setup**: Check Supabase documentation
- **Database Issues**: Check migration script and RLS policies
- **Frontend Issues**: Check browser console and network tab
