import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const upurfitProducts = [
  {
    name: "Thermo Gel – Pre-Workout",
    price: 399,
    original_price: 599,
    category: "Pre-Workout",
    description: "Warming gel to prepare muscles and help with activation before exercise. Perfect for pre-workout muscle preparation.",
    features: ["Muscle preparation", "Pre-workout activation", "Warming effect", "Easy application"],
    image: ["/src/assets/hero-sports-health-bg.webp"], // Sports health background
    stock: 50,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "Cryo Cooling Gel – Post Workout",
    price: 399,
    original_price: 599,
    category: "Recovery",
    description: "Cooling gel for sore muscles and post-workout relief. Helps with muscle recovery and reduces inflammation.",
    features: ["Post-workout cooling", "Muscle recovery", "Reduces inflammation", "Soothing relief"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 50,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "Cryo Pain Relief Spray – Instant Ice Cooling",
    price: 399,
    original_price: 649,
    category: "Pain Relief",
    description: "Instant ice cooling spray for sudden pain and inflammation. Provides immediate cooling effect for pain relief.",
    features: ["Instant cooling", "Pain relief", "Anti-inflammatory", "Easy spray application"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 50,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "Epsom Salts Body Wash – Magnesium Absorption Recovery",
    price: 499,
    original_price: 699,
    category: "Recovery",
    description: "Post-exercise body wash with magnesium absorption for muscle relaxation. Use in shower for enhanced recovery.",
    features: ["Magnesium absorption", "Muscle relaxation", "Post-exercise wash", "Recovery enhancement"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 50,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "Hot & Cold Compression Sleeve",
    price: 1199,
    original_price: 1499,
    category: "Pain Relief",
    description: "Compression sleeve for joints and limbs with hot and cold temperature therapy support.",
    features: ["Compression support", "Temperature therapy", "Joint protection", "Versatile use"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 30,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "XXXL Body & Face Wipes (30 Wipes)",
    price: 399,
    original_price: 597,
    category: "Hygiene",
    description: "Large wipes for body and face post-sports or gym sessions. Perfect for quick clean-up after workouts.",
    features: ["Extra large size", "Body and face safe", "Post-workout hygiene", "30 wipes pack"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 75,
    rating: 4,
    reviews: 0,
    is_active: true,
    is_new: false
  },
  {
    name: "XXL Shampoo Wipes – Waterless Shampoo (30 Wipes)",
    price: 399,
    original_price: 597,
    category: "Hygiene",
    description: "Waterless shampoo wipes for hair and scalp hygiene on-the-go. Great when you can't wash hair immediately after workout.",
    features: ["Waterless shampoo", "Hair and scalp hygiene", "On-the-go convenience", "30 wipes pack"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 75,
    rating: 4,
    reviews: 0,
    is_active: true,
    is_new: false
  },
  {
    name: "Gym Kit – Thermo Gel + Cryo Gel + 3XL Body & Face Wipes + Premium Pouch",
    price: 899,
    original_price: 1397,
    category: "Bundles",
    description: "Complete gym recovery set combining warming, cooling, and clean-up essentials with premium storage pouch.",
    features: ["Complete gym kit", "Warming and cooling", "Clean-up wipes", "Premium pouch included"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 25,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "UpUrFit × Jonty Rhodes Cricket Kit",
    price: 999,
    original_price: 1547,
    category: "Bundles",
    description: "Cricket-themed recovery kit curated with Jonty Rhodes. Multiple products for comprehensive cricket recovery.",
    features: ["Cricket-specific recovery", "Jonty Rhodes collaboration", "Multiple products", "Sports-themed bundle"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 20,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "MCFC Football Recovery Kit – Cryo Gel + Epsom Salts Body Wash + 3XL wipes + Premium Pouch",
    price: 999,
    original_price: 1497,
    category: "Bundles",
    description: "Football recovery kit for team sports with cooling gel, body wash, hygiene wipes, and convenient premium pouch.",
    features: ["Football recovery kit", "Team sports focused", "Complete recovery set", "Premium pouch included"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 20,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: true
  },
  {
    name: "Performance Duo – Thermo Gel + Epsom Salts Body Wash",
    price: 799,
    original_price: 1298,
    category: "Bundles",
    description: "Paired set for warming and post-workout wash. Perfect combination for pre and post exercise care.",
    features: ["Pre and post workout", "Warming gel included", "Recovery body wash", "Perfect pairing"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 35,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: false
  },
  {
    name: "Recovery Duo – Cryo Gel + Epsom Salts Body Wash",
    price: 799,
    original_price: 1298,
    category: "Bundles",
    description: "Cooling and wash combination for after workout recovery. Essential duo for post-exercise care.",
    features: ["Post-workout recovery", "Cooling gel included", "Recovery body wash", "Essential duo"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 35,
    rating: 5,
    reviews: 0,
    is_active: true,
    is_new: false
  },
  {
    name: "Active Cleansing & Hygiene 101 Kit",
    price: 398,
    original_price: null,
    category: "Hygiene",
    description: "General post-workout cleansing and hygiene essentials kit. Everything you need for post-exercise hygiene.",
    features: ["Post-workout cleansing", "Hygiene essentials", "Complete kit", "Value bundle"],
    image: ["/src/assets/hero-pets.jpg"],
    stock: 40,
    rating: 4,
    reviews: 0,
    is_active: true,
    is_new: false
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting bulk product insertion...");

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if products already exist to avoid duplicates
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("name");

    if (checkError) {
      console.error("Error checking existing products:", checkError);
      throw new Error("Failed to check existing products");
    }

    const existingNames = existingProducts?.map(p => p.name) || [];
    const newProducts = upurfitProducts.filter(product => 
      !existingNames.includes(product.name)
    );

    if (newProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "All Upurfit products already exist in the database",
          skipped: upurfitProducts.length
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Inserting ${newProducts.length} new products...`);

    // Insert products in bulk
    const { data, error: insertError } = await supabase
      .from("products")
      .insert(newProducts)
      .select();

    if (insertError) {
      console.error("Error inserting products:", insertError);
      throw new Error(`Failed to insert products: ${insertError.message}`);
    }

    console.log(`Successfully inserted ${data?.length || 0} products`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully added ${data?.length || 0} Upurfit products`,
        inserted: data?.length || 0,
        skipped: upurfitProducts.length - newProducts.length,
        products: data?.map(p => ({ id: p.id, name: p.name })) || []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Bulk add products error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});