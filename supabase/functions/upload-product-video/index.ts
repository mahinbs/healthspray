import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

interface UploadVideoRequest {
  productId: string;
  videoFile: File;
  thumbnailFile?: File;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    console.log("Starting upload process...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey
    });

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Authenticating user...");
    
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error("Auth error:", authError);
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    console.log("User authenticated:", user.id);

    // Skip admin check for now to test basic upload
    console.log("Skipping admin check for testing...");

    // Parse multipart form data
    console.log("Parsing form data...");
    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const videoFile = formData.get("videoFile") as File;
    const thumbnailFile = formData.get("thumbnailFile") as File;

    console.log("Form data parsed:", {
      productId,
      videoFileName: videoFile?.name,
      videoFileSize: videoFile?.size,
      thumbnailFileName: thumbnailFile?.name
    });

    if (!productId || !videoFile) {
      throw new Error("Product ID and video file are required");
    }

    // Basic file validation
    if (videoFile.size > 50 * 1024 * 1024) { // 50MB
      throw new Error("Video file too large. Maximum size: 50MB");
    }

    console.log("Creating service client for storage...");
    // Create Supabase client with service role for storage operations
    const supabaseService = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    // Generate unique file names
    const timestamp = Date.now();
    const videoFileName = `product-${productId}-${timestamp}.${videoFile.name.split('.').pop()}`;

    console.log("Uploading video to storage...");
    // Upload video to Supabase Storage (using the existing bucket name with typos)
    const { data: videoUploadData, error: videoUploadError } = await supabaseService.storage
      .from("prodcut-vidoes")
      .upload(videoFileName, videoFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (videoUploadError) {
      console.error("Video upload error:", videoUploadError);
      throw new Error(`Failed to upload video: ${videoUploadError.message}`);
    }

    console.log("Video uploaded successfully:", videoUploadData.path);

    // Get public URL for video
    const { data: videoUrlData } = supabaseService.storage
      .from("prodcut-vidoes")
      .getPublicUrl(videoUploadData.path);

    console.log("Video URL:", videoUrlData.publicUrl);

    // Update product with video information
    console.log("Updating product in database...");
    const { data: updatedProduct, error: updateError } = await supabaseService
      .from("products")
      .update({
        video_url: videoUrlData.publicUrl,
        has_video: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to update product: ${updateError.message}`);
    }

    console.log("Product updated successfully:", updatedProduct.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Video uploaded successfully",
        videoUrl: videoUrlData.publicUrl,
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          has_video: updatedProduct.has_video
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error uploading video:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
