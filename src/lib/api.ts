import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type Veterinarian = Database['public']['Tables']['veterinarians']['Row'];
export type Administrator = Database['public']['Tables']['administrators']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Treatment = Database['public']['Tables']['treatments']['Row'];
export type ClinicalAssessment = Database['public']['Tables']['clinical_assessments']['Row'];
export type TreatmentOutcome = Database['public']['Tables']['treatment_outcomes']['Row'];
export type LabResult = Database['public']['Tables']['lab_results']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];
export type ClinicalNote = Database['public']['Tables']['clinical_notes']['Row'];
export type AdverseEvent = Database['public']['Tables']['adverse_events']['Row'];
export type ProtocolDeviation = Database['public']['Tables']['protocol_deviations']['Row'];
export type DrugShipment = Database['public']['Tables']['drug_shipments']['Row'];
export type BottleInventory = Database['public']['Tables']['bottle_inventory']['Row'];
export type StorageConfirmation = Database['public']['Tables']['storage_confirmations']['Row'];
export type EligibilityScreening = Database['public']['Tables']['eligibility_screenings']['Row'];
export type InformedConsent = Database['public']['Tables']['informed_consents']['Row'];
export type Site = Database['public']['Tables']['sites']['Row'];
export type StudySettings = Database['public']['Tables']['study_settings']['Row'];

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getVeterinarian(id: string) {
  const { data, error } = await supabase
    .from('veterinarians')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Veterinarian;
}

export async function getAdministrator(id: string) {
  const { data, error } = await supabase
    .from('administrators')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Administrator;
}

export async function getVeterinarianByEmail(email: string) {
  const { data, error } = await supabase
    .from('veterinarians')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data as Veterinarian | null;
}

export async function getAdministratorByEmail(email: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function getPatientsForVet(vetId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('veterinarian_id', vetId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Patient[];
}

export async function getAllPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Patient[];
}

export async function getPatientById(id: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*, veterinarians(*), sites(*)' as any)
    .eq('id', id)
    .single();
  if (error) throw error;
  return (data as unknown) as Patient & { veterinarians: Veterinarian; sites: Site };
}

export async function createPatient(patient: Partial<Patient>) {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient as any)
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, patient: Partial<Patient>) {
  const { error } = await supabase
    .from('patients')
    .update({ ...patient, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function softDeletePatient(id: string) {
  const { error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function lockPatient(id: string, vetId: string) {
  const { error } = await supabase
    .from('patients')
    .update({ status: 'locked', locked_at: new Date().toISOString(), locked_by: vetId } as any)
    .eq('id', id as any);
  if (error) throw error;
}

export async function freezePatient(id: string, vetId: string) {
  const { error } = await supabase
    .from('patients')
    .update({ status: 'frozen', frozen_at: new Date().toISOString(), frozen_by: vetId } as any)
    .eq('id', id as any);
  if (error) throw error;
}

export async function getTreatmentsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('treatment_number', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Treatment[];
}

export async function getLabsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw error;
  return (data ?? []) as LabResult[];
}

export async function getAssessmentsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('clinical_assessments')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('assessment_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClinicalAssessment[];
}

export async function getConsentForms(patientId: string) {
  const { data, error } = await supabase
    .from('informed_consents')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getAdverseEventsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('adverse_events')
    .select('*')
    .eq('patient_id', patientId);
  if (error) throw error;
  return (data ?? []) as AdverseEvent[];
}

export async function getShipments() {
  const { data, error } = await supabase.from('drug_shipments').select('*, sites(*)');
  if (error) throw error;
  return (data ?? []) as DrugShipment[];
}

export async function createShipment(shipment: Partial<DrugShipment>) {
  const { data, error } = await supabase.from('drug_shipments').insert(shipment as any).select().single();
  if (error) throw error;
  return data as DrugShipment;
}

export async function updateShipment(id: string, shipment: Partial<DrugShipment>) {
  const { error } = await supabase.from('drug_shipments').update(shipment as any).eq('id', id);
  if (error) throw error;
}

export async function getBottlesForShipment(shipmentId: string) {
  const { data, error } = await supabase.from('bottle_inventory').select('*').eq('shipment_id', shipmentId);
  if (error) throw error;
  return (data ?? []) as BottleInventory[];
}

export async function createBottle(bottle: Partial<BottleInventory>) {
  const { data, error } = await supabase.from('bottle_inventory').insert(bottle as any).select().single();
  if (error) throw error;
  return data as BottleInventory;
}

export async function updateBottle(id: string, bottle: Partial<BottleInventory>) {
  const { error } = await supabase.from('bottle_inventory').update(bottle as any).eq('id', id);
  if (error) throw error;
}

export async function getSites() {
  const { data, error } = await supabase.from('sites').select('*');
  if (error) throw error;
  return (data ?? []) as Site[];
}

export async function getStorageForSite(siteId: string) {
  const { data, error } = await supabase.from('storage_confirmations').select('*').eq('site_id', siteId);
  if (error) throw error;
  return (data ?? []) as StorageConfirmation[];
}

export async function createStorage(storage: Partial<StorageConfirmation>) {
  const { data, error } = await supabase.from('storage_confirmations').insert(storage as any).select().single();
  if (error) throw error;
  return data as StorageConfirmation;
}

export async function getVideosForPatient(patientId: string) {
  const { data, error } = await supabase.from('videos').select('*').eq('patient_id', patientId);
  if (error) throw error;
  return (data ?? []) as Video[];
}

export async function createAssessment(assessment: Partial<ClinicalAssessment>) {
  const { data, error } = await supabase.from('clinical_assessments').insert(assessment as any).select().single();
  if (error) throw error;
  return data as ClinicalAssessment;
}

export async function createTreatment(treatment: Partial<Treatment>) {
  const { data, error } = await supabase.from('treatments').insert(treatment as any).select().single();
  if (error) throw error;
  return data as Treatment;
}

export async function createLabResult(lab: Partial<LabResult>) {
  const { data, error } = await supabase.from('lab_results').insert(lab as any).select().single();
  if (error) throw error;
  return data as LabResult;
}

export async function createVideo(video: Partial<Video>) {
  const { data, error } = await supabase.from('videos').insert(video as any).select().single();
  if (error) throw error;
  return data as Video;
}

// Alias used by AdverseEvents/Reports
export const getAEsForPatient = getAdverseEventsForPatient;

export async function createAE(ae: Partial<AdverseEvent>) {
  const { data, error } = await supabase.from('adverse_events').insert(ae as any).select().single();
  if (error) throw error;
  return data as AdverseEvent;
}

export async function updateAE(id: string, ae: Partial<AdverseEvent>) {
  const { data, error } = await supabase.from('adverse_events').update(ae as any).eq('id', id).select().single();
  if (error) throw error;
  return data as AdverseEvent;
}

export async function submitFdaReport(aeId: string, reportType?: string, narrative?: string) {
  const { data, error } = await supabase.from('adverse_events').update({
    fda_report_submitted: true,
    fda_report_date: new Date().toISOString(),
    fda_report_type: reportType ?? 'medwatch',
    narrative: narrative ?? '',
  } as any).eq('id', aeId).select().single();
  if (error) throw error;
  return data as AdverseEvent;
}

export async function createConsent(consent: Partial<InformedConsent>) {
  const { data, error } = await supabase.from('informed_consents').insert(consent as any).select().single();
  if (error) throw error;
  return data as InformedConsent;
}

export async function updateConsent(id: string, consent: Partial<InformedConsent>) {
  const { data, error } = await supabase.from('informed_consents').update(consent as any).eq('id', id).select().single();
  if (error) throw error;
  return data as InformedConsent;
}

export async function generateConsentPDF(consentId: string, patientId: string, ownerName: string, signatureData: string | null) {
  const { data, error } = await supabase.from('informed_consents').update({
    document_url: `/consents/${consentId}.pdf`,
    signed_at: new Date().toISOString(),
    owner_name: ownerName,
    signature_data: signatureData,
  } as any).eq('id', consentId).select().single();
  if (error) throw error;
  return data as InformedConsent;
}

export async function getAuditLogs(page = 0, pageSize = 50) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return data ?? [];
}

export async function getStudySettings() {
  const { data, error } = await supabase.from('study_settings').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateStudySettings(settings: Record<string, any>) {
  const { error } = await supabase.from('study_settings').update(settings).eq('id', settings.id);
  if (error) throw error;
}

export async function getAllVeterinarians() {
  const { data, error } = await supabase.from('veterinarians').select('*').order('full_name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function approveVeterinarian(id: string, approverId: string) {
  const { error } = await supabase.from('veterinarians').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: approverId }).eq('id', id);
  if (error) throw error;
}

export async function suspendVeterinarian(id: string) {
  const { error } = await supabase.from('veterinarians').update({ status: 'suspended' }).eq('id', id);
  if (error) throw error;
}

// ─── Admin credential helper ───────────────────────────────────────────
// Last 4 chars of current password shown as a hint for the account holder.
const ADMIN_CREDENTIAL_HINT = "···P102";
export { ADMIN_CREDENTIAL_HINT };

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

// ─── Deal Room ────────────────────────────────────────────────────────
export async function getDealOwnerByEmail(email: string) {
  const { data, error } = await supabase.from('deal_room_owners').select('*').eq('email', email).single();
  if (error) throw error;
  return data;
}

export async function getDealTransactions(ownerId: string) {
  const { data, error } = await supabase.from('deal_room_transactions').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Edge Function calls
export async function callEdgeFunction<T>(functionName: string, body: any): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) throw error;
  return data as T;
}

export async function createVeterinarianProfile(data: {
  email: string;
  full_name: string;
  license_number: string;
  license_state?: string;
  license_expiry_date?: string;
  phone?: string;
  address?: string;
}) {
  return callEdgeFunction('create-vet-profile', data);
}

export async function createDealTransaction(ownerId: string, tx: Record<string, any>) {
  const { data, error } = await supabase.from('deal_room_transactions').insert({ owner_id: ownerId, ...tx }).select().single();
  if (error) throw error;
  return data;
}

export async function updateDealTransaction(id: string, patch: Record<string, any>) {
  const { data, error } = await supabase.from('deal_room_transactions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
