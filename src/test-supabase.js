// Simple test script to verify Supabase connection
// Run this in your browser console to test the connection

import { supabase } from './integrations/supabase/client.js';

// Test 1: Check if we can connect
console.log('Testing Supabase connection...');

// Test 2: Try to query the products table
supabase
  .from('products')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Error connecting to products table:', error);
      console.log('💡 Make sure you have run the SQL migration in your Supabase dashboard');
    } else {
      console.log('✅ Successfully connected to products table!');
      console.log('📊 Found', data?.length || 0, 'products');
    }
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
  });

// Test 3: Check table structure
supabase
  .rpc('get_table_info', { table_name: 'products' })
  .then(({ data, error }) => {
    if (!error) {
      console.log('📋 Table structure:', data);
    }
  })
  .catch(() => {
    // This might fail, that's okay
    console.log('ℹ️ Could not get table structure (this is normal)');
  });
