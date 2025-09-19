import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  amount: number;
  items: any[];
  deliveryAddress: any;
  idempotency_key?: string;
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
    let body: CreateOrderRequest;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Invalid JSON in request body");
    }

    const { amount, items, deliveryAddress, idempotency_key } = body;

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    if (!deliveryAddress) {
      throw new Error("Delivery address is required");
    }

    console.log("Creating order for amount:", amount);

    
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Idempotency: if an order with this key already exists for this user, return it
    if (idempotency_key) {
      const { data: existingOrder } = await supabaseClient
        .from("orders")
        .select("id, razorpay_order_id, amount, currency")
        .eq("user_id", user.id)
        .eq("idempotency_key", idempotency_key)
        .maybeSingle();

      if (existingOrder && existingOrder.razorpay_order_id) {
        console.log("Existing order found for idempotency_key:", idempotency_key);
        return new Response(
          JSON.stringify({
            orderId: existingOrder.razorpay_order_id,
            amount: existingOrder.amount,
            currency: existingOrder.currency || "INR",
            keyId: razorpayKeyId,
            orderDbId: existingOrder.id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    console.log("No existing order. Creating new Razorpay order");

    // Create order with Razorpay
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
        currency: "INR",
        receipt: `order_${Date.now()}_${user.id.substring(0, 8)}`,
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error:", errorText);
      throw new Error(`Failed to create Razorpay order: ${razorpayResponse.statusText}`);
    }

    const razorpayOrderData = await razorpayResponse.json();
    console.log("Razorpay order created:", razorpayOrderData.id);

    // Create order in database using service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: order, error: dbError } = await supabaseService
      .from("orders")
      .insert({
        user_id: user.id,
        razorpay_order_id: razorpayOrderData.id,
        amount: Math.round(amount * 100), // Store in paise
        items: items,
        delivery_address: deliveryAddress,
        status: "pending",
        idempotency_key: idempotency_key || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to create order in database");
    }

    console.log("Order created in database:", order.id);

    return new Response(
      JSON.stringify({
        orderId: razorpayOrderData.id,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        keyId: razorpayKeyId,
        orderDbId: order.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});