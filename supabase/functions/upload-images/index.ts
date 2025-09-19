import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse form data
    const formData = await req.formData();
    
    // Get uploaded files
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing ${files.length} files`);

    // Upload files to Supabase Storage
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`Uploading file ${index + 1}: ${file.name}, size: ${file.size}`);
        
        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${index}.${extension}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, file, {
            contentType: file.type,
            upsert: false
          });

        if (error) {
          console.error(`Storage upload failed for file ${index + 1}:`, error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filename);

        console.log(`Successfully uploaded file ${index + 1}:`, publicUrl);
        
        return {
          success: true,
          url: publicUrl,
          path: data.path,
          filename: file.name
        };
      } catch (error) {
        console.error(`Error uploading file ${index + 1}:`, error);
        return {
          success: false,
          error: error.message,
          filename: file.name
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Upload complete. Successful: ${successful.length}, Failed: ${failed.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        uploaded: successful,
        failed: failed,
        total: files.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Upload function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});