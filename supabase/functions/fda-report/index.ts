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

    const { ae_id, report_type = "initial", narrative } = await req.json();

    // Fetch AE with full context
    const { data: ae, error: aeError } = await supabase
      .from("adverse_events")
      .select(`
        *,
        patients (*, veterinarians!patients_veterinarian_id_fkey (full_name, license_number, clinic_name, email), sites (name)),
        veterinarians (full_name, license_number, clinic_name, email)
      `)
      .eq("id", ae_id)
      .single();

    if (aeError || !ae) {
      return new Response(
        JSON.stringify({ error: "Adverse event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const patient = ae.patients;
    const vet = ae.veterinarians;
    const site = patient?.sites;

    // Build FDA 21 CFR Part 511.1 compliant report
    const fdaReport = {
      // Header
      report_type: report_type, // "initial", "follow_up", "final"
      report_date: new Date().toISOString().split("T")[0],
      sponsor_name: "Byrock Technologies Ltd",
      inad_number: "INAD-PTP102-2025",
      study_title: "PTP-102 Laminitis Clinical Trial",

      // Patient identifying info (permitted for safety reports)
      patient: {
        patient_number: patient?.patient_number,
        species: "Equus caballus",
        breed: patient?.breed,
        age_years: patient?.age_years,
        age_months: patient?.age_months,
        sex: patient?.sex,
        weight_kg: patient?.weight_kg,
      },

      // Site info
      site: {
        name: site?.name,
        veterinarian: vet?.full_name,
        veterinarian_license: vet?.license_number,
        veterinarian_clinic: vet?.clinic_name,
      },

      // Adverse Event Details
      adverse_event: {
        ae_number: ae.ae_number,
        onset_date: ae.onset_date,
        resolution_date: ae.resolution_date,
        description: ae.description,
        severity: ae.severity,
        causality: ae.causality,
        outcome: ae.outcome,
        is_serious: ae.is_serious,
        action_taken: ae.action_taken,
      },

      // Drug Information
      drug: {
        name: "PTP-102",
        lot_number: await getCurrentLotNumber(supabase, patient?.id),
        dose: await getCurrentDose(supabase, patient?.id),
        route: "intravenous",
        indication: "Laminitis treatment under INAD",
      },

      // Narrative
      narrative: narrative || buildDefaultNarrative(ae, patient, vet),

      // Lab results if available
      lab_results: await getRecentLabs(supabase, patient?.id),

      // Concomitant medications
      concomitant_meds: await getConcomitantMeds(supabase, patient?.id),
    };

    // Store FDA correspondence
    const { data: fdaDoc, error: fdaError } = await supabase
      .from("fda_correspondence")
      .insert({
        reference_number: `FDA-${ae.ae_number}-${report_type.toUpperCase()}-${Date.now()}`,
        correspondence_type: "safety_report",
        subject: `Safety Report: ${ae.ae_number} (${ae.severity})`,
        content: JSON.stringify(fdaReport, null, 2),
        sponsor_name: "Byrock Technologies Ltd",
      })
      .select()
      .single();

    if (fdaError) {
      return new Response(
        JSON.stringify({ error: fdaError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update AE as reported
    await supabase
      .from("adverse_events")
      .update({
        is_reported_to_fda: true,
        fda_report_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", ae_id);

    // Audit
    await supabase.from("audit_logs").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: "create",
      table_name: "fda_correspondence",
      record_id: fdaDoc.id,
      new_values: { ae_number: ae.ae_number, report_type, is_reportable: ae.is_serious },
    });

    return new Response(
      JSON.stringify({
        fda_report: fdaReport,
        correspondence_id: fdaDoc.id,
        reference_number: fdaDoc.reference_number,
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

async function getCurrentLotNumber(supabase: any, patientId: string): Promise<string> {
  const { data } = await supabase
    .from("treatments")
    .select("drug_lot_number")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0]?.drug_lot_number || "Unknown";
}

async function getCurrentDose(supabase: any, patientId: string): Promise<string> {
  const { data } = await supabase
    .from("treatments")
    .select("dose_mg")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0]?.dose_mg ? `${data[0].dose_mg} mg` : "Unknown";
}

function buildDefaultNarrative(ae: any, patient: any, vet: any): string {
  return [
    `Adverse event ${ae.ae_number} reported in patient ${patient?.patient_number} (${patient?.horse_name}).`,
    `Onset: ${ae.onset_date}. Severity: ${ae.severity}. Causality: ${ae.causality}. Outcome: ${ae.outcome}.`,
    `Description: ${ae.description}`,
    `Action taken: ${ae.action_taken || "None documented"}.`,
    `Reporting veterinarian: ${vet?.full_name} (License: ${vet?.license_number}).`,
    `Site: ${patient?.sites?.name || "Unknown"}.`,
    `Drug: PTP-102. Lot: ${ae.drug_lot_number || "Unknown"}.`,
    `Concomitant medications: ${patient?.current_medications || "None documented"}.`,
  ].join("\n");
}

async function getRecentLabs(supabase: any, patientId: string): Promise<any[]> {
  const { data } = await supabase
    .from("lab_results")
    .select("*")
    .eq("patient_id", patientId)
    .order("sample_date", { ascending: false })
    .limit(10);
  return data || [];
}

async function getConcomitantMeds(supabase: any, patientId: string): Promise<string> {
  const { data } = await supabase
    .from("eligibility_screenings")
    .select("current_medications")
    .eq("patient_id", patientId)
    .order("screened_at", { ascending: false })
    .limit(1);
  return data?.[0]?.current_medications || "None documented";
}