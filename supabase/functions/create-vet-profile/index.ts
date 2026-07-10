import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.DEV_CORS_ORIGIN || "https://byrock.eth.limo",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, full_name, license_number, license_state, license_expiry_date, phone, address } = await req.json();

    if (!email || !full_name || !license_number) {
      return new Response(
        JSON.stringify({ error: "email, full_name, and license_number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create auth user with temporary password (vet will reset via recovery)
    const tempPassword = crypto.randomUUID();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, role: "vet" },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vetId = authData.user.id;

    // 2. Insert veterinarian profile with pending status
    const { error: profileError } = await supabase
      .from("veterinarians")
      .insert({
        id: vetId,
        email,
        full_name,
        license_number,
        license_state,
        license_expiry_date,
        phone,
        address,
        status: "pending",
      });

    if (profileError) {
      // Clean up auth user if profile insert fails
      await supabase.auth.admin.deleteUser(vetId);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Generate recovery link for vet to set their password
    const { data: recoveryData, error: recoveryError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    if (recoveryError) {
      console.error("Recovery link generation failed:", recoveryError);
    }

    // 4. Log audit
    await supabase.from("audit_logs").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: "create",
      table_name: "veterinarians",
      record_id: vetId,
      new_values: { email, full_name, license_number, status: "pending" },
    });

    return new Response(
      JSON.stringify({
        veterinarian: { id: vetId, email, full_name, license_number, status: "pending" },
        recovery_link: recoveryData?.properties?.action_link || null,
        message: "Veterinarian created. Send recovery link to vet to set password.",
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});