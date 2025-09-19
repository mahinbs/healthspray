import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error("Auth error:", authError);
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    console.log("User authenticated:", user.id);

    // Parse request body
    let body: VerifyPaymentRequest;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Invalid JSON in request body");
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification parameters");
    }

    console.log("Verifying payment for order:", razorpay_order_id);

    // Verify payment signature using secret from Supabase Edge Function secrets
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    // Create signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ).then(key => 
      crypto.subtle.sign("HMAC", key, new TextEncoder().encode(bodyString))
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch:", {
        expected: expectedSignature,
        received: razorpay_signature,
        body: bodyString
      });
      throw new Error("Invalid payment signature");
    }

    console.log("Payment signature verified successfully");

    // Update order status in database using service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: dbError } = await supabaseService
      .from("orders")
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to update order status");
    }

    if (!order) {
      throw new Error("Order not found");
    }

    console.log("Order status updated to paid:", order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order,
        message: "Payment verified successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});