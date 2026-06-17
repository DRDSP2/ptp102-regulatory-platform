import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

    const { event_type, payload } = await req.json();

    // This webhook can be called from external systems or database triggers
    // to create audit entries for actions that happen outside the normal flow
    // (e.g., manual database changes, external API calls)

    const { user_id, action, table_name, record_id, old_values, new_values, reason } = payload;

    if (!user_id || !action || !table_name) {
      return new Response(
        JSON.stringify({ error: "user_id, action, and table_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user exists and get role
    const { data: userData } = await supabase.auth.admin.getUserById(user_id);
    const userEmail = userData.user?.email || "unknown";

    let userRole = "unknown";
    const { data: adminData } = await supabase
      .from("administrators")
      .select("role")
      .eq("id", user_id)
      .single();
    if (adminData) userRole = adminData.role;

    const { data: vetData } = await supabase
      .from("veterinarians")
      .select("id")
      .eq("id", user_id)
      .single();
    if (vetData) userRole = "vet";

    // Insert audit log
    const { data: auditLog, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id,
        user_email: userEmail,
        user_role: userRole,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        reason,
        session_id: crypto.randomUUID(),
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ audit_log: auditLog }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});