import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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

    const { consent_id, patient_id, owner_name, owner_signature_base64 } = await req.json();

    if (!consent_id || !patient_id || !owner_name) {
      return new Response(
        JSON.stringify({ error: "consent_id, patient_id, and owner_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch patient and study data
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*, veterinarians(full_name, license_number), sites(name)")
      .eq("id", patient_id)
      .single();

    if (patientError || !patient) {
      return new Response(
        JSON.stringify({ error: "Patient not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settings } = await supabase
      .from("study_settings")
      .select("*")
      .limit(1)
      .single();

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;

    // Title
    page.drawText("INFORMED CONSENT FORM", { x: 50, y, size: 20, font: fontBold, color: rgb(0, 0, 0) });
    y -= 30;
    page.drawText(`Study: ${settings?.study_title || "PTP-102 Laminitis Clinical Trial"}`, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= 18;
    page.drawText(`INAD Number: ${settings?.inad_number || "INAD-PTP102-2025"}`, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= 18;
    page.drawText(`Protocol Version: ${settings?.protocol_version || "1.0"}`, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= 30;

    // Patient Info
    page.drawText("PATIENT INFORMATION", { x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
    y -= 22;
    const patientInfo = [
      `Horse Name: ${patient.horse_name}`,
      `Patient Number: ${patient.patient_number}`,
      `Breed: ${patient.breed || "N/A"}`,
      `Age: ${patient.age_years || "N/A"} years ${patient.age_months || 0} months`,
      `Sex: ${patient.sex || "N/A"}`,
      `Weight: ${patient.weight_kg || "N/A"} kg`,
      `Veterinarian: ${patient.veterinarians?.full_name || "N/A"} (License: ${patient.veterinarians?.license_number || "N/A"})`,
      `Site: ${patient.sites?.name || "N/A"}`,
      `Owner: ${owner_name}`,
    ];
    for (const line of patientInfo) {
      page.drawText(line, { x: 60, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 16;
    }
    y -= 20;

    // Study Description
    page.drawText("STUDY DESCRIPTION", { x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
    y -= 22;
    const studyDesc = [
      "This study evaluates the safety and efficacy of PTP-102 for the treatment of",
      "laminitis in horses under FDA INAD authorization. Participation involves:",
      "",
      "• Administration of investigational drug PTP-102 per protocol schedule",
      "• Regular clinical assessments (Obel scoring, lameness grading, vital signs)",
      "• Laboratory testing (blood work, imaging as protocol requires)",
      "• Video gait analysis at specified intervals",
      "• Adverse event monitoring and reporting per 21 CFR Part 11 requirements",
      "",
      "Estimated duration: Per protocol schedule. You may withdraw at any time.",
    ];
    for (const line of studyDesc) {
      page.drawText(line, { x: 60, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= 14;
    }
    y -= 10;

    // Risks & Benefits
    page.drawText("RISKS AND BENEFITS", { x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
    y -= 22;
    const risks = [
      "Potential risks include: adverse reactions to PTP-102, injection site reactions,",
      "temporary worsening of lameness, and unknown long-term effects.",
      "",
      "Potential benefits: Improvement in laminitis clinical signs, contribution to",
      "veterinary knowledge for future treatments.",
      "",
      "Alternative treatments: Standard of care for laminitis (NSAIDs, corrective shoeing,",
      "stall rest, cryotherapy) are available outside this study.",
    ];
    for (const line of risks) {
      page.drawText(line, { x: 60, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= 14;
    }
    y -= 15;

    // Confidentiality & 21 CFR Part 11
    page.drawText("CONFIDENTIALITY & REGULATORY COMPLIANCE", { x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
    y -= 22;
    const compliance = [
      "All data collected will be handled per FDA 21 CFR Part 11 (electronic records",
      "and signatures) and ICH-GCP E6(R2) guidelines. Electronic signatures on this",
      "document are legally equivalent to handwritten signatures. Data may be shared",
      "with FDA CVM, study monitors, and the sponsor (Byrock Technologies Ltd).",
    ];
    for (const line of compliance) {
      page.drawText(line, { x: 60, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= 14;
    }
    y -= 20;

    // Signature
    page.drawText("OWNER CONSENT", { x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
    y -= 22;
    page.drawText("I have read and understand this consent form. I voluntarily agree to participate.", { x: 60, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 30;
    page.drawText(`Owner Name: ${owner_name}`, { x: 60, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 18;
    page.drawText("Signature: _________________________________________", { x: 60, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 18;
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 60, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 30;

    // Footer
    page.drawText(`Generated: ${new Date().toISOString()} | Document Version: ${settings?.protocol_version || "1.0"}`, { x: 50, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

    // Add signature if provided
    if (owner_signature_base64) {
      try {
        const sigBytes = Uint8Array.from(atob(owner_signature_base64), c => c.charCodeAt(0));
        const sigImage = await pdfDoc.embedPng(sigBytes);
        const sigDims = sigImage.scale(0.3);
        page.drawImage(sigImage, { x: 100, y: y + 20, width: sigDims.width, height: sigDims.height });
      } catch (e) {
        console.warn("Signature embed failed:", e);
      }
    }

    const pdfBytes = await pdfDoc.save();

    // Upload to Storage
    const fileName = `consents/${patient_id}/${consent_id}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update consent record with document URL
    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

    await supabase
      .from("informed_consents")
      .update({
        document_url: publicUrl,
        consent_status: "signed",
        signed_at: new Date().toISOString(),
      })
      .eq("id", consent_id);

    // Audit log
    await supabase.from("audit_logs").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: "create",
      table_name: "informed_consents",
      record_id: consent_id,
      new_values: { document_url: publicUrl, consent_status: "signed" },
    });

    return new Response(
      JSON.stringify({ document_url: publicUrl, pdf_bytes: Array.from(pdfBytes) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("PDF generation error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});