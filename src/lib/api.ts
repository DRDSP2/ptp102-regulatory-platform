import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type Veterinarian = Database['public']['Tables']['veterinarians']['Row'];
export type Administrator = Database['public']['Tables']['administrators']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type Treatment = Database['public']['Tables']['treatments']['Row'];
export type ClinicalAssessment = Database['public']['Tables']['clinical_assessments']['Row'];

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
