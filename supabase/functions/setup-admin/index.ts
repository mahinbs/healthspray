import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupAdminRequest {
  email: string;
  password: string;
  setupKey: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, setupKey }: SetupAdminRequest = await req.json();

    // Simple setup key validation (in production, use a secure method)
    const SETUP_KEY = Deno.env.get("ADMIN_SETUP_KEY") || "setup-admin-zippty-2024";
    
    if (setupKey !== SETUP_KEY) {
      throw new Error("Invalid setup key");
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if any admin users already exist
    const { data: existingAdmins, error: checkError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .limit(1);

    if (checkError) {
      console.error("Error checking existing admins:", checkError);
      throw new Error("Failed to check existing admin users");
    }

    if (existingAdmins && existingAdmins.length > 0) {
      throw new Error("Admin user already exists. This setup can only be used once.");
    }

    // Create the user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      throw new Error("Failed to create admin user in auth system");
    }

    // Add user to admin_users table
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        user_id: authData.user.id,
        role: "admin",
        permissions: ["manage_products", "manage_orders", "manage_users"],
        is_active: true,
      })
      .select()
      .single();

    if (adminError) {
      console.error("Error creating admin user:", adminError);
      // Try to clean up the auth user if admin user creation failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup auth user:", cleanupError);
      }
      throw new Error("Failed to create admin user in database");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        admin: {
          id: adminUser.id,
          email: authData.user.email,
          role: adminUser.role,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Setup admin error:", error);
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