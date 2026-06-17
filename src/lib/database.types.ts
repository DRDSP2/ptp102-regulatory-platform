/* Generated from Supabase schema — DO NOT EDIT MANUALLY
   Run: npx supabase gen types typescript --project-id vtxrmjuftqtealzymqbk --schema public > src/lib/database.types.ts
*/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      study_settings: {
        Row: {
          id: string;
          study_name: string;
          protocol_number: string;
          sponsor_name: string;
          indication: string;
          phase: string;
          fda_ind_number: string;
          ica_email: string | null;
          dsb_email: string | null;
          regulatory_contact_email: string | null;
          enrollment_target: number;
          randomization_ratio: string;
          primary_endpoint: string | null;
          secondary_endpoints: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['study_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['study_settings']['Insert']>;
      };
      veterinarians: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          license_number: string;
          license_state: string;
          license_expiry_date: string;
          clinic_name: string | null;
          clinic_address: string | null;
          phone: string | null;
          speciality: string | null;
          status: 'pending' | 'approved' | 'suspended';
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['veterinarians']['Row'], 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>;
        Update: Partial<Database['public']['Tables']['veterinarians']['Insert']>;
      };
      administrators: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'super_admin' | 'admin' | 'monitor';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['administrators']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['administrators']['Insert']>;
      };
      sites: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          country: string;
          contact_person: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          ica_approval_date: string | null;
          status: 'active' | 'inactive' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sites']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sites']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          patient_number: string;
          horse_name: string;
          owner_name: string;
          owner_email: string | null;
          owner_phone: string | null;
          microchip_id: string | null;
          breed: string | null;
          age_years: number | null;
          sex: 'stallion' | 'mare' | 'gelding' | null;
          weight_kg: number | null;
          site_id: string;
          veterinarian_id: string;
          enrollment_date: string | null;
          randomization_arm: 'treatment' | 'placebo' | null;
          status: 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn' | 'lost_to_followup';
          withdrawal_reason: string | null;
          withdrawal_date: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      treatments: {
        Row: {
          id: string;
          patient_id: string;
          veterinarian_id: string | null;
          treatment_number: number;
          treatment_date: string;
          drug_name: string;
          dose: string;
          route: string;
          batch_number: string | null;
          lot_expiry: string | null;
          administered_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['treatments']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Database['public']['Tables']['treatments']['Insert']>;
      };
      clinical_assessments: {
        Row: {
          id: string;
          patient_id: string;
          veterinarian_id: string;
          assessment_date: string;
          visit_type: 'screening' | 'baseline' | 'scheduled' | 'unscheduled' | 'end_of_study';
          aaep_score: number | null;
          aaep_grade: '0' | '1' | '2' | '3' | '4' | '5' | null;
          lameness_grade: '0' | '1' | '2' | '3' | '4' | '5' | null;
          hoof_tester_score: number | null;
          digital_pulse_score: '0' | '1' | '2' | '3' | null;
          pain_score: number | null;
          joint_flexion_score: '0' | '1' | '2' | '3' | null;
          radiographic_score: number | null;
          ultrasound_score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['clinical_assessments']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Database['public']['Tables']['clinical_assessments']['Insert']>;
      };
      lab_results: {
        Row: {
          id: string;
          patient_id: string;
          sample_date: string;
          sample_type: 'blood' | 'synovial_fluid' | 'urine' | 'other';
          test_panel: string;
          results_json: Json;
          reference_ranges_json: Json;
          lab_facility: string | null;
          status: 'pending' | 'final' | 'amended';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['lab_results']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Database['public']['Tables']['lab_results']['Insert']>;
      };
      videos: {
        Row: {
          id: string;
          patient_id: string;
          veterinarian_id: string | null;
          video_type: 'gait_analysis' | 'lameness_exam' | 'hoof_capsule' | 'other';
          title: string;
          description: string | null;
          storage_path: string;
          duration_seconds: number | null;
          file_size_mb: number | null;
          uploaded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at' | 'updated_at' | 'uploaded_at'>;
        Update: Partial<Database['public']['Tables']['videos']['Insert']>;
      };
      adverse_events: {
        Row: {
          id: string;
          patient_id: string;
          reported_by: string;
          onset_date: string;
          ae_term: string;
          meddra_code: string | null;
          severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal';
          serious: boolean;
          relationship: 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
          outcome: 'recovered' | 'recovering' | 'not_recovered' | 'fatal' | 'unknown';
          action_taken: 'none' | 'dose_reduced' | 'drug_withdrawn' | 'concomitant_med' | 'hospitalization' | 'other';
          narrative: string | null;
          meds_at_onset: string | null;
          relevant_labs: string | null;
          report_status: 'draft' | 'submitted' | 'acknowledged' | 'closed' | null;
          fda_report_id: string | null;
          fda_submission_date: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['adverse_events']['Row'], 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'report_status' | 'fda_report_id' | 'fda_submission_date'>;
        Update: Partial<Database['public']['Tables']['adverse_events']['Insert']>;
      };
      informed_consents: {
        Row: {
          id: string;
          patient_id: string;
          owner_name: string;
          owner_signature: string | null;
          owner_signature_hash: string | null;
          witness_name: string | null;
          witness_signature: string | null;
          witness_signature_hash: string | null;
          veterinarian_id: string | null;
          veterinarian_signature: string | null;
          veterinarian_signature_hash: string | null;
          consent_version: string;
          consent_date: string;
          consent_pdf_path: string | null;
          ip_address: string | null;
          user_agent: string | null;
          revoked_at: string | null;
          revocation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['informed_consents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['informed_consents']['Insert']>;
      };
      drug_shipments: {
        Row: {
          id: string;
          site_id: string;
          batch_number: string;
          manufacturer: string;
          drug_name: string;
          strength: string;
          quantity_shipped: number;
          quantity_received: number;
          shipment_date: string;
          expected_delivery: string | null;
          actual_delivery: string | null;
          tracking_number: string | null;
          carrier: string | null;
          status: 'pending' | 'in_transit' | 'delivered' | 'received' | 'discrepancy';
          temperature_log: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['drug_shipments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['drug_shipments']['Insert']>;
      };
      drug_bottles: {
        Row: {
          id: string;
          shipment_id: string;
          bottle_number: string;
          volume_ml: number;
          concentration_mg_ml: number;
          expiry_date: string;
          status: 'received' | 'stored' | 'dispensed' | 'returned' | 'destroyed';
          storage_location: string | null;
          dispensed_to_patient: string | null;
          dispensed_at: string | null;
          returned_at: string | null;
          destroyed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['drug_bottles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['drug_bottles']['Insert']>;
      };
      storage_logs: {
        Row: {
          id: string;
          site_id: string;
          storage_type: 'refrigerator' | 'freezer' | 'ultra_low' | 'ambient';
          temperature_c: number;
          humidity_percent: number | null;
          recorded_at: string;
          recorded_by: string | null;
          equipment_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['storage_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['storage_logs']['Insert']>;
      };
      protocol_deviations: {
        Row: {
          id: string;
          patient_id: string | null;
          site_id: string | null;
          deviation_type: 'eligibility' | 'procedure' | 'medication' | 'visit' | 'data' | 'safety' | 'other';
          description: string;
          severity: 'minor' | 'major' | 'critical';
          occurred_at: string;
          reported_by: string;
          reported_at: string;
          resolution: string | null;
          resolved_at: string | null;
          status: 'open' | 'investigating' | 'resolved' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['protocol_deviations']['Row'], 'id' | 'created_at' | 'updated_at' | 'reported_at'>;
        Update: Partial<Database['public']['Tables']['protocol_deviations']['Insert']>;
      };
      monitoring_visits: {
        Row: {
          id: string;
          site_id: string;
          monitor_name: string;
          visit_date: string;
          visit_type: 'initiation' | 'routine' | 'closeout' | 'for_cause';
          findings: string | null;
          action_items: string | null;
          status: 'scheduled' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['monitoring_visits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['monitoring_visits']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          table_name: string;
          record_id: string | null;
          action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
    };
    Views: {
      patient_summary: {
        Row: {
          id: string;
          patient_number: string;
          horse_name: string;
          owner_name: string;
          site_name: string;
          veterinarian_name: string;
          status: string;
          enrollment_date: string | null;
          last_assessment: string | null;
          total_assessments: number;
          total_treatments: number;
          total_aes: number;
          serious_aes: number;
        };
      };
    };
    Functions: {
      create_vet_profile: {
        Args: { p_user_id: string; p_email: string; p_full_name: string; p_license_number: string; p_license_state: string; p_license_expiry_date: string; p_clinic_name?: string; p_phone?: string; p_speciality?: string };
        Returns: string;
      };
      generate_consent_pdf: {
        Args: { p_consent_id: string };
        Returns: string;
      };
      fda_e2b_report: {
        Args: { p_ae_id: string; p_report_type: 'initial' | 'followup' | 'periodic' };
        Returns: Json;
      };
      get_next_patient_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      veterinarian_status: 'pending' | 'approved' | 'suspended';
      administrator_role: 'super_admin' | 'admin' | 'monitor';
      site_status: 'active' | 'inactive' | 'pending';
      patient_status: 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn' | 'lost_to_followup';
      patient_sex: 'stallion' | 'mare' | 'gelding';
      visit_type: 'screening' | 'baseline' | 'scheduled' | 'unscheduled' | 'end_of_study';
      aaep_grade_enum: '0' | '1' | '2' | '3' | '4' | '5';
      lameness_grade_enum: '0' | '1' | '2' | '3' | '4' | '5';
      sample_type_enum: 'blood' | 'synovial_fluid' | 'urine' | 'other';
      lab_status_enum: 'pending' | 'final' | 'amended';
      video_type_enum: 'gait_analysis' | 'lameness_exam' | 'hoof_capsule' | 'other';
      ae_severity_enum: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal';
      ae_relationship_enum: 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
      ae_outcome_enum: 'recovered' | 'recovering' | 'not_recovered' | 'fatal' | 'unknown';
      ae_action_taken_enum: 'none' | 'dose_reduced' | 'drug_withdrawn' | 'concomitant_med' | 'hospitalization' | 'other';
      ae_report_status: 'draft' | 'submitted' | 'acknowledged' | 'closed';
      shipment_status_enum: 'pending' | 'in_transit' | 'delivered' | 'received' | 'discrepancy';
      bottle_status_enum: 'received' | 'stored' | 'dispensed' | 'returned' | 'destroyed';
      storage_type_enum: 'refrigerator' | 'freezer' | 'ultra_low' | 'ambient';
      deviation_type_enum: 'eligibility' | 'procedure' | 'medication' | 'visit' | 'data' | 'safety' | 'other';
      deviation_severity_enum: 'minor' | 'major' | 'critical';
      deviation_status_enum: 'open' | 'investigating' | 'resolved' | 'closed';
      visit_type_monitor_enum: 'initiation' | 'routine' | 'closeout' | 'for_cause';
      audit_action_enum: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
    };
  };
};