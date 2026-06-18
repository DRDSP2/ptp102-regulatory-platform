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
  return data as Patient & { veterinarians: Veterinarian; sites: Site };
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
  const { data, error } = await supabase
    .from('patients')
    .update({ ...patient, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
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

// Treatments
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

export async function createTreatment(treatment: Partial<Treatment>) {
  const { data, error } = await supabase
    .from('treatments')
    .insert(treatment as any)
    .select()
    .single();
  if (error) throw error;
  return data as Treatment;
}

export async function updateTreatment(id: string, treatment: Partial<Treatment>) {
  const { data, error } = await supabase
    .from('treatments')
    .update({ ...treatment, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Treatment;
}

// Clinical Assessments
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

export async function createAssessment(assessment: Partial<ClinicalAssessment>) {
  const { data, error } = await supabase
    .from('clinical_assessments')
    .insert(assessment as any)
    .select()
    .single();
  if (error) throw error;
  return data as ClinicalAssessment;
}

export async function updateAssessment(id: string, assessment: Partial<ClinicalAssessment>) {
  const { data, error } = await supabase
    .from('clinical_assessments')
    .update(assessment as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ClinicalAssessment;
}

// Treatment Outcomes
export async function getOutcomesForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('outcome_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as TreatmentOutcome[];
}

export async function createOutcome(outcome: Partial<TreatmentOutcome>) {
  const { data, error } = await supabase
    .from('treatment_outcomes')
    .insert(outcome as any)
    .select()
    .single();
  if (error) throw error;
  return data as TreatmentOutcome;
}

// Lab Results
export async function getLabsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('sample_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LabResult[];
}

export async function createLabResult(lab: Partial<LabResult>) {
  const { data, error } = await supabase
    .from('lab_results')
    .insert(lab as any)
    .select()
    .single();
  if (error) throw error;
  return data as LabResult;
}

// Videos
export async function getVideosForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Video[];
}

export async function createVideo(video: Partial<Video>) {
  const { data, error } = await supabase
    .from('videos')
    .insert(video as any)
    .select()
    .single();
  if (error) throw error;
  return data as Video;
}

// Clinical Notes
export async function getNotesForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClinicalNote[];
}

export async function createNote(note: Partial<ClinicalNote>) {
  const { data, error } = await supabase
    .from('clinical_notes')
    .insert(note as any)
    .select()
    .single();
  if (error) throw error;
  return data as ClinicalNote;
}

export async function updateNote(id: string, note: Partial<ClinicalNote>) {
  const { data, error } = await supabase
    .from('clinical_notes')
    .update({ ...note, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ClinicalNote;
}

// Adverse Events
export async function getAEsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('adverse_events')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('onset_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdverseEvent[];
}

export async function createAE(ae: Partial<AdverseEvent>) {
  const { data, error } = await supabase
    .from('adverse_events')
    .insert(ae as any)
    .select()
    .single();
  if (error) throw error;
  return data as AdverseEvent;
}

export async function updateAE(id: string, ae: Partial<AdverseEvent>) {
  const { data, error } = await supabase
    .from('adverse_events')
    .update({ ...ae, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AdverseEvent;
}

// Protocol Deviations
export async function getDeviationsForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('protocol_deviations')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('date_occurred', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProtocolDeviation[];
}

export async function createDeviation(deviation: Partial<ProtocolDeviation>) {
  const { data, error } = await supabase
    .from('protocol_deviations')
    .insert(deviation as any)
    .select()
    .single();
  if (error) throw error;
  return data as ProtocolDeviation;
}

// Eligibility Screenings
export async function getScreeningForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('eligibility_screenings')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as EligibilityScreening | null;
}

export async function createScreening(screening: Partial<EligibilityScreening>) {
  const { data, error } = await supabase
    .from('eligibility_screenings')
    .insert(screening as any)
    .select()
    .single();
  if (error) throw error;
  return data as EligibilityScreening;
}

// Informed Consents
export async function getConsentForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('informed_consents')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as InformedConsent | null;
}

export async function createConsent(consent: Partial<InformedConsent>) {
  const { data, error } = await supabase
    .from('informed_consents')
    .insert(consent as any)
    .select()
    .single();
  if (error) throw error;
  return data as InformedConsent;
}

export async function updateConsent(id: string, consent: Partial<InformedConsent>) {
  const { data, error } = await supabase
    .from('informed_consents')
    .update(consent as any)
    .eq('id', id as any)
    .select()
    .single();
  if (error) throw error;
  return data as InformedConsent;
}

// Sites
export async function getSites() {
  const { data, error } = await supabase
    .from('sites')
    .select('*, veterinarians(*)' as any)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function createSite(site: Partial<Site>) {
  const { data, error } = await supabase
    .from('sites')
    .insert(site as any)
    .select()
    .single();
  if (error) throw error;
  return data as Site;
}

// Drug Shipments
export async function getShipments() {
  const { data, error } = await supabase
    .from('drug_shipments')
    .select('*, sites(*), bottle_inventory(*)' as any)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createShipment(shipment: Partial<DrugShipment>) {
  const { data, error } = await supabase
    .from('drug_shipments')
    .insert(shipment as any)
    .select()
    .single();
  if (error) throw error;
  return data as DrugShipment;
}

export async function updateShipment(id: string, shipment: Partial<DrugShipment>) {
  const { data, error } = await supabase
    .from('drug_shipments')
    .update({ ...shipment, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DrugShipment;
}

// Bottle Inventory
export async function getBottlesForShipment(shipmentId: string) {
  const { data, error } = await supabase
    .from('bottle_inventory')
    .select('*')
    .eq('shipment_id', shipmentId)
    .is('deleted_at', null);
  if (error) throw error;
  return (data ?? []) as BottleInventory[];
}

export async function createBottle(bottle: Partial<BottleInventory>) {
  const { data, error } = await supabase
    .from('bottle_inventory')
    .insert(bottle as any)
    .select()
    .single();
  if (error) throw error;
  return data as BottleInventory;
}

export async function updateBottle(id: string, bottle: Partial<BottleInventory>) {
  const { data, error } = await supabase
    .from('bottle_inventory')
    .update({ ...bottle, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BottleInventory;
}

// Storage Confirmations
export async function getStorageForSite(siteId: string) {
  const { data, error } = await supabase
    .from('storage_confirmations')
    .select('*')
    .eq('site_id', siteId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as StorageConfirmation[];
}

export async function createStorage(storage: Partial<StorageConfirmation>) {
  const { data, error } = await supabase
    .from('storage_confirmations')
    .insert(storage as any)
    .select()
    .single();
  if (error) throw error;
  return data as StorageConfirmation;
}

// Study Settings
export async function getStudySettings() {
  const { data, error } = await supabase
    .from('study_settings')
    .select('*')
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as StudySettings | null;
}

export async function updateStudySettings(settings: Partial<StudySettings>) {
  const { data, error } = await supabase
    .from('study_settings')
    .upsert({ ...settings, updated_at: new Date().toISOString() } as any)
    .select()
    .single();
  if (error) throw error;
  return data as StudySettings;
}

// Veterinarian Management
export async function getAllVeterinarians() {
  const { data, error } = await supabase
    .from('veterinarians')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Veterinarian[];
}

export async function approveVeterinarian(id: string, approvedBy: string) {
  const { data, error } = await supabase
    .from('veterinarians')
    .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: approvedBy } as any)
    .eq('id', id as any)
    .select()
    .single();
  if (error) throw error;
  return data as Veterinarian;
}

export async function suspendVeterinarian(id: string) {
  const { data, error } = await supabase
    .from('veterinarians')
    .update({ status: 'suspended' } as any)
    .eq('id', id as any)
    .select()
    .single();
  if (error) throw error;
  return data as Veterinarian;
}

// Audit Logs
export async function getAuditLogs(filters?: { table?: string; action?: string; user_id?: string; limit?: number }) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters?.limit ?? 100);

  if (filters?.table) query = query.eq('table_name', filters.table);
  if (filters?.action) query = query.eq('action', filters.action);
  if (filters?.user_id) query = query.eq('user_id', filters.user_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
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

export async function generateConsentPDF(consentId: string, patientId: string, ownerName: string, signatureBase64?: string) {
  return callEdgeFunction<{ document_url: string }>('generate-consent-pdf', {
    consent_id: consentId,
    patient_id: patientId,
    owner_name: ownerName,
    owner_signature_base64: signatureBase64,
  });
}

export async function submitFdaReport(aeId: string, reportType = 'initial', narrative?: string) {
  return callEdgeFunction('fda-report', {
    ae_id: aeId,
    report_type: reportType,
    narrative,
  });
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
