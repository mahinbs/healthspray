import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddAdminRequest {
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
    const { email, password, setupKey }: AddAdminRequest = await req.json();

    // Simple setup key validation
    const SETUP_KEY = Deno.env.get("ADMIN_SETUP_KEY") || "setup-admin-zippty-2024";
    
    if (setupKey !== SETUP_KEY) {
      throw new Error("Invalid setup key");
    }

    console.log(`Creating admin user: ${email}`);

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if user already exists in auth
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      console.error("Error searching for existing user:", searchError);
      throw new Error("Failed to check existing users");
    }

    const existingUser = existingUsers.users.find(user => user.email === email);
    
    let userId: string;

    if (existingUser) {
      console.log(`User ${email} already exists in auth`);
      userId = existingUser.id;
    } else {
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

      userId = authData.user.id;
      console.log(`Created new user ${email} with ID: ${userId}`);
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: checkAdminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (checkAdminError && checkAdminError.code !== "PGRST116") {
      console.error("Error checking existing admin:", checkAdminError);
      throw new Error("Failed to check existing admin status");
    }

    if (existingAdmin) {
      console.log(`User ${email} is already an admin`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "User is already an admin",
          admin: {
            id: existingAdmin.id,
            email: email,
            role: existingAdmin.role,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Add user to admin_users table
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        user_id: userId,
        role: "admin",
        permissions: ["manage_products", "manage_orders", "manage_users"],
        is_active: true,
      })
      .select()
      .single();

    if (adminError) {
      console.error("Error creating admin user:", adminError);
      throw new Error("Failed to create admin user in database");
    }

    console.log(`Successfully created admin user: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        admin: {
          id: adminUser.id,
          email: email,
          role: adminUser.role,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Add admin error:", error);
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