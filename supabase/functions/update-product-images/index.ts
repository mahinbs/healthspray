import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting product image update process...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Product name to image URL mapping
    const productImageMap = {
      "Thermo Gel – Pre-Workout": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299481/Extrifit_thermogel_25x80_termogeninis_riebalu_degintojas_1000x_l32gue.jpg"
      ],
      "Cryo Cooling Gel – Post Workout": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299481/images_1_v3ypzb.jpg"
      ],
      "Cryo Pain Relief Spray – Instant Ice Cooling": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299481/download_3_bsaf93.jpg"
      ],
      "Epsom Salts Body Wash – Magnesium Absorption Recovery": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299481/images_3_l4hnhy.jpg"
      ],
      "Hot & Cold Compression Sleeve": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299481/download_2_uxk3v9.jpg"
      ],
      "XXXL Body & Face Wipes (30 Wipes)": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299480/download_4_rjvrvv.jpg"
      ],
      "XXL Shampoo Wipes – Waterless Shampoo (30 Wipes)": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299480/images_2_kj4wps.jpg"
      ],
      "Gym Kit – Thermo Gel + Cryo Gel + 3XL Body & Face Wipes + Premium Pouch": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299480/images_5_fxyyqe.jpg"
      ],
      "UpUrFit × Jonty Rhodes Cricket Kit": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299480/download_5_x7epxc.jpg"
      ],
      "MCFC Football Recovery Kit – Cryo Gel + Epsom Salts Body Wash + 3XL wipes + Premium Pouch": [
        "https://res.cloudinary.com/dknafpppp/image/upload/v1758299480/images_4_wau0xe.jpg"
      ]
    };

    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Update each product with its corresponding image
    for (const [productName, imageUrls] of Object.entries(productImageMap)) {
      try {
        console.log(`Updating images for product: ${productName}`);
        
        // Find the product by name
        const { data: products, error: fetchError } = await supabase
          .from('products')
          .select('id, name')
          .eq('name', productName);

        if (fetchError) {
          console.error(`Error fetching product ${productName}:`, fetchError);
          errors.push(`Failed to fetch ${productName}: ${fetchError.message}`);
          continue;
        }

        if (!products || products.length === 0) {
          console.log(`Product not found: ${productName}`);
          skippedCount++;
          continue;
        }

        const product = products[0];
        
        // Update the product with new images
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            image: imageUrls,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Error updating product ${productName}:`, updateError);
          errors.push(`Failed to update ${productName}: ${updateError.message}`);
        } else {
          console.log(`Successfully updated ${productName} with ${imageUrls.length} image(s)`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Unexpected error updating ${productName}:`, error);
        errors.push(`Unexpected error for ${productName}: ${error.message}`);
      }
    }

    console.log(`Update complete. Updated: ${updatedCount}, Skipped: ${skippedCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully updated ${updatedCount} products with new images`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in update-product-images function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});