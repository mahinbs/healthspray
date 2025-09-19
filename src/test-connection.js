// Test script to verify Supabase connection
// Run this in your browser console

// Test the connection directly
fetch('https://tdzyskyjqobglueymvmx.supabase.co/rest/v1/products?select=*&limit=1', {
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkenlza3lqcW9iZ2x1ZXltdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjM4MzYsImV4cCI6MjA3MDEzOTgzNn0.5fQXZ2dJF30gPq_VtKmg4L-_fV5pOp5Pd56PU5mHcUM',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkenlza3lqcW9iZ2x1ZXltdm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjM4MzYsImV4cCI6MjA3MDEzOTgzNn0.5fQXZ2dJF30gPq_VtKmg4L-_fV5pOp5Pd56PU5mHcUM',
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Response status:', response.status);
  if (response.ok) {
    console.log('✅ Table exists and is accessible!');
    return response.json();
  } else {
    console.log('❌ Table does not exist or is not accessible');
    return response.text();
  }
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('❌ Error:', error);
});
