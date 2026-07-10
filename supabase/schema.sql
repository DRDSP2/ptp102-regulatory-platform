-- ============================================================
-- PTP-102 Laminitis Trial Platform — Supabase Schema
-- Version: 1.0.0
-- Sponsor: Byrock Technologies Ltd
-- Purpose: FDA CVM / INAD regulatory-ready backend
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE patient_status AS ENUM ('screening', 'enrolled', 'active', 'completed', 'withdrawn', 'locked', 'frozen');
CREATE TYPE consent_status AS ENUM ('pending', 'signed', 'withdrawn', 'expired');
CREATE TYPE vet_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE obel_score AS ENUM ('0', '1', '2', '3', '4', '5');
CREATE TYPE ae_severity AS ENUM ('mild', 'moderate', 'severe', 'life_threatening');
CREATE TYPE ae_causality AS ENUM ('unrelated', 'unlikely', 'possible', 'probable', 'definite');
CREATE TYPE ae_outcome AS ENUM ('ongoing', 'resolved', 'resolved_with_sequelae', 'fatal', 'unknown');
CREATE TYPE shipment_status AS ENUM ('pending', 'shipped', 'in_transit', 'delivered', 'returned', 'lost');
CREATE TYPE bottle_status AS ENUM ('in_stock', 'dispensed', 'returned', 'destroyed', 'expired');
CREATE TYPE storage_status AS ENUM ('pending', 'confirmed', 'violation');
CREATE TYPE site_readiness AS ENUM ('not_started', 'in_progress', 'ready', 'inspection_required', 'approved');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'lock', 'freeze', 'approve', 'reject', 'ship', 'receive');
CREATE TYPE protocol_deviation_type AS ENUM ('inclusion_criteria', 'dosing', 'schedule', 'procedure', 'documentation', 'other');
CREATE TYPE protocol_deviation_severity AS ENUM ('minor', 'major', 'critical');
CREATE TYPE monitoring_visit_type AS ENUM ('pre_study', 'periodic', 'for_cause', 'close_out');

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE public.veterinarians (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    clinic_name TEXT,
    license_number TEXT NOT NULL,
    license_state TEXT,
    license_expiry_date DATE,
    phone TEXT,
    address TEXT,
    status vet_status DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.veterinarians(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.administrators (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'monitor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT DEFAULT 'US',
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    readiness site_readiness DEFAULT 'not_started',
    inspection_date DATE,
    approval_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_number TEXT NOT NULL UNIQUE,
    horse_name TEXT NOT NULL,
    breed TEXT,
    age_years INTEGER,
    age_months INTEGER,
    sex TEXT CHECK (sex IN ('gelding', 'stallion', 'mare')),
    weight_kg DECIMAL(6,2),
    owner_name TEXT NOT NULL,
    owner_phone TEXT,
    owner_email TEXT,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    site_id UUID REFERENCES public.sites(id),
    status patient_status DEFAULT 'screening',
    enrollment_date DATE,
    completion_date DATE,
    withdrawal_date DATE,
    withdrawal_reason TEXT,
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES public.veterinarians(id),
    frozen_at TIMESTAMPTZ,
    frozen_by UUID REFERENCES public.veterinarians(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.study_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inad_number TEXT NOT NULL DEFAULT 'INAD-PTP102-2025',
    protocol_version TEXT NOT NULL DEFAULT '1.0',
    protocol_start_hour INTEGER NOT NULL DEFAULT 0,
    sponsor_name TEXT NOT NULL DEFAULT 'Byrock Technologies Ltd',
    principal_investigator TEXT,
    study_title TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.eligibility_screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    inclusion_criteria JSONB NOT NULL DEFAULT '{}',
    exclusion_criteria JSONB NOT NULL DEFAULT '{}',
    laminitis_history TEXT,
    previous_treatments TEXT,
    current_medications TEXT,
    inclusion_criteria_met BOOLEAN,
    exclusion_criteria_met BOOLEAN,
    is_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    screened_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.protocol_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version TEXT NOT NULL,
    effective_date DATE NOT NULL,
    summary TEXT NOT NULL,
    document_url TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.administrators(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.informed_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    owner_signature_url TEXT,
    consent_status consent_status DEFAULT 'pending',
    signed_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    version TEXT NOT NULL DEFAULT '1.0',
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    treatment_number INTEGER NOT NULL,
    treatment_date DATE NOT NULL,
    drug_lot_number TEXT,
    dose_mg DECIMAL(8,2),
    route TEXT DEFAULT 'intravenous',
    administered_by TEXT,
    administered_at TIMESTAMPTZ,
    next_treatment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(patient_id, treatment_number)
);

CREATE TABLE public.clinical_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    assessment_date DATE NOT NULL,
    obel_score obel_score,
    lameness_grade INTEGER CHECK (lameness_grade BETWEEN 0 AND 5),
    hoof_temperature TEXT,
    digital_pulse TEXT,
    hoof_tester_response TEXT,
    gait_analysis TEXT,
    body_condition_score DECIMAL(3,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    temperature_celsius DECIMAL(4,1),
    general_appearance TEXT,
    overall_impression TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.treatment_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    outcome_scale TEXT NOT NULL,
    score DECIMAL(5,2),
    outcome_date DATE NOT NULL,
    notes TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    lab_name TEXT,
    sample_date DATE NOT NULL,
    sample_type TEXT,
    test_name TEXT NOT NULL,
    result_value TEXT,
    reference_range TEXT,
    unit TEXT,
    is_abnormal BOOLEAN DEFAULT FALSE,
    is_critical BOOLEAN DEFAULT FALSE,
    report_url TEXT,
    reviewed_by UUID REFERENCES public.veterinarians(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.veterinarians(id),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes INTEGER,
    mime_type TEXT,
    video_type TEXT CHECK (video_type IN ('gait_analysis', 'treatment', 'adverse_event', 'general')),
    description TEXT,
    recorded_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    note_type TEXT CHECK (note_type IN ('general', 'treatment', 'assessment', 'adverse_event', 'protocol_deviation')),
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.adverse_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    ae_number TEXT NOT NULL UNIQUE,
    onset_date DATE NOT NULL,
    resolution_date DATE,
    description TEXT NOT NULL,
    severity ae_severity NOT NULL,
    causality ae_causality,
    outcome ae_outcome DEFAULT 'ongoing',
    action_taken TEXT,
    is_serious BOOLEAN DEFAULT FALSE,
    is_reported_to_fda BOOLEAN DEFAULT FALSE,
    fda_report_date DATE,
    reviewed_by UUID REFERENCES public.administrators(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.protocol_deviations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    deviation_type protocol_deviation_type NOT NULL,
    severity protocol_deviation_severity NOT NULL,
    description TEXT NOT NULL,
    date_occurred DATE NOT NULL,
    corrective_action TEXT,
    preventive_action TEXT,
    is_closed BOOLEAN DEFAULT FALSE,
    closed_by UUID REFERENCES public.administrators(id),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.monitoring_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    visit_type monitoring_visit_type NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    monitor_name TEXT,
    findings TEXT,
    capa_items TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.administrators(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.drug_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_number TEXT NOT NULL UNIQUE,
    tracking_number TEXT,
    carrier TEXT,
    site_id UUID REFERENCES public.sites(id),
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    status shipment_status DEFAULT 'pending',
    shipped_at TIMESTAMPTZ,
    estimated_arrival DATE,
    delivered_at TIMESTAMPTZ,
    received_by TEXT,
    condition_on_arrival TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.bottle_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.drug_shipments(id),
    bottle_number TEXT NOT NULL UNIQUE,
    lot_number TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    site_id UUID REFERENCES public.sites(id),
    veterinarian_id UUID REFERENCES public.veterinarians(id),
    status bottle_status DEFAULT 'in_stock',
    dispensed_to_patient_id UUID REFERENCES public.patients(id),
    dispensed_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    destroyed_at TIMESTAMPTZ,
    destroyed_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.storage_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id),
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarians(id),
    storage_type TEXT CHECK (storage_type IN ('refrigerator', 'freezer', 'room_temp', 'secure_cabinet')),
    temperature_celsius DECIMAL(4,1),
    humidity_percent DECIMAL(5,2),
    is_secure BOOLEAN DEFAULT FALSE,
    is_temperature_monitored BOOLEAN DEFAULT FALSE,
    status storage_status DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.fda_correspondence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT NOT NULL UNIQUE,
    correspondence_type TEXT CHECK (correspondence_type IN ('submission', 'response', 'inquiry', 'inspection', 'safety_report')),
    subject TEXT NOT NULL,
    content TEXT,
    document_url TEXT,
    sponsor_name TEXT NOT NULL DEFAULT 'Byrock Technologies Ltd',
    sent_by UUID REFERENCES public.administrators(id),
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================
-- AUDIT TRAIL
-- ============================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_role TEXT,
    action audit_action NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_patients_vet ON public.patients(veterinarian_id);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_site ON public.patients(site_id);
CREATE INDEX idx_treatments_patient ON public.treatments(patient_id);
CREATE INDEX idx_assessments_patient ON public.clinical_assessments(patient_id);
CREATE INDEX idx_lab_results_patient ON public.lab_results(patient_id);
CREATE INDEX idx_videos_patient ON public.videos(patient_id);
CREATE INDEX idx_notes_patient ON public.clinical_notes(patient_id);
CREATE INDEX idx_ae_patient ON public.adverse_events(patient_id);
CREATE INDEX idx_ae_severity ON public.adverse_events(severity);
CREATE INDEX idx_shipments_site ON public.drug_shipments(site_id);
CREATE INDEX idx_bottles_shipment ON public.bottle_inventory(shipment_id);
CREATE INDEX idx_bottles_patient ON public.bottle_inventory(dispensed_to_patient_id);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at);


-- ─── Deal Room ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deal_room_owners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  deal_tier TEXT DEFAULT 'exploring',
  deal_status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deal_room_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.deal_room_owners(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount_usd NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  signed_document_url TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.administrators(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deal_room_transactions_owner ON public.deal_room_transactions(owner_id);
CREATE INDEX idx_deal_room_transactions_status ON public.deal_room_transactions(status);

ALTER TABLE public.deal_room_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deal_owner_self_read" ON public.deal_room_owners FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');
CREATE POLICY "deal_owner_admin_write" ON public.deal_room_owners FOR ALL USING (EXISTS (SELECT 1 FROM public.administrators WHERE id = auth.uid() AND role IN ('admin','super_admin')));
CREATE POLICY "deal_transactions_owner_read" ON public.deal_room_transactions FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.administrators WHERE id = auth.uid() AND role IN ('admin','super_admin')));
CREATE POLICY "deal_transactions_owner_insert" ON public.deal_room_transactions FOR INSERT WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.administrators WHERE id = auth.uid() AND role IN ('admin','super_admin')));
CREATE POLICY "deal_transactions_admin_update" ON public.deal_room_transactions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.administrators WHERE id = auth.uid() AND role IN ('admin','super_admin')));
