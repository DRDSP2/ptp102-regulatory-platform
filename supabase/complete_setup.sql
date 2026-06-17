-- ============================================================
-- PTP-102 Laminitis Trial Platform — Complete Supabase Setup
-- Run this ENTIRE file in Supabase SQL Editor
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

-- Administrators
CREATE TABLE public.administrators (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'monitor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Veterinarians
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

-- Sites
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

-- Patients
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

-- Study Settings (singleton)
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

-- Eligibility Screenings
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

-- Protocol Versions
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

-- Informed Consents
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

-- Treatments
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

-- Clinical Assessments
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

-- Treatment Outcomes (NEW - structured)
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

-- Lab Results
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

-- Videos
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

-- Clinical Notes
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

-- Adverse Events
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

-- Protocol Deviations
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

-- Monitoring Visits (NEW)
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

-- Drug Shipments
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

-- Bottle Inventory
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

-- Storage Confirmations
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

-- FDA Correspondence
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

-- Audit Logs
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
CREATE INDEX idx_outcomes_patient ON public.treatment_outcomes(patient_id);
CREATE INDEX idx_lab_results_patient ON public.lab_results(patient_id);
CREATE INDEX idx_videos_patient ON public.videos(patient_id);
CREATE INDEX idx_notes_patient ON public.clinical_notes(patient_id);
CREATE INDEX idx_ae_patient ON public.adverse_events(patient_id);
CREATE INDEX idx_ae_severity ON public.adverse_events(severity);
CREATE INDEX idx_deviations_patient ON public.protocol_deviations(patient_id);
CREATE INDEX idx_shipments_site ON public.drug_shipments(site_id);
CREATE INDEX idx_bottles_shipment ON public.bottle_inventory(shipment_id);
CREATE INDEX idx_bottles_patient ON public.bottle_inventory(dispensed_to_patient_id);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at);

-- Partial indexes for soft-delete
CREATE INDEX idx_patients_active ON public.patients(veterinarian_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_treatments_active ON public.treatments(patient_id) WHERE deleted_at IS NULL;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informed_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adverse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottle_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fda_correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for role detection
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.administrators
        WHERE id = auth.uid() AND deleted_at IS NULL
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_vet()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.veterinarians
        WHERE id = auth.uid() AND deleted_at IS NULL
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_vet_id()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT id FROM public.veterinarians
        WHERE id = auth.uid() AND deleted_at IS NULL
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_admin_id()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN (
        SELECT id FROM public.administrators
        WHERE id = auth.uid() AND deleted_at IS NULL
    );
END;
$$;

-- ============================================================
-- RLS POLICIES BY TABLE
-- ============================================================

-- administrators: admin CRUD, self-read
CREATE POLICY "admin_all" ON public.administrators FOR ALL USING (public.is_admin());
CREATE POLICY "admin_self_read" ON public.administrators FOR SELECT USING (id = auth.uid());

-- veterinarians: admin CRUD, vet self-read/update, pending vets readable by admin
CREATE POLICY "vet_admin_all" ON public.veterinarians FOR ALL USING (public.is_admin());
CREATE POLICY "vet_self" ON public.veterinarians FOR SELECT USING (id = auth.uid());
CREATE POLICY "vet_self_update" ON public.veterinarians FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- sites: admin CRUD, site vet read
CREATE POLICY "site_admin_all" ON public.sites FOR ALL USING (public.is_admin());
CREATE POLICY "site_vet_read" ON public.sites FOR SELECT USING (veterinarian_id = auth.uid());

-- patients: admin all, vet own patients CRUD, owner read own (via email match)
CREATE POLICY "patient_admin_all" ON public.patients FOR ALL USING (public.is_admin());
CREATE POLICY "patient_vet_all" ON public.patients FOR ALL USING (veterinarian_id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "patient_owner_read" ON public.patients FOR SELECT USING (owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- study_settings: admin CRUD, all authenticated read (singleton)
CREATE POLICY "settings_admin_all" ON public.study_settings FOR ALL USING (public.is_admin());
CREATE POLICY "settings_read_all" ON public.study_settings FOR SELECT USING (auth.role() = 'authenticated');

-- eligibility_screenings: admin all, vet own patients
CREATE POLICY "screening_admin_all" ON public.eligibility_screenings FOR ALL USING (public.is_admin());
CREATE POLICY "screening_vet_all" ON public.eligibility_screenings FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- protocol_versions: admin CRUD, all read
CREATE POLICY "protocol_admin_all" ON public.protocol_versions FOR ALL USING (public.is_admin());
CREATE POLICY "protocol_read_all" ON public.protocol_versions FOR SELECT USING (auth.role() = 'authenticated');

-- informed_consents: admin all, vet own patients, owner read own
CREATE POLICY "consent_admin_all" ON public.informed_consents FOR ALL USING (public.is_admin());
CREATE POLICY "consent_vet_all" ON public.informed_consents FOR ALL USING (
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);
CREATE POLICY "consent_owner_read" ON public.informed_consents FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- treatments: admin all, vet own patients
CREATE POLICY "treatment_admin_all" ON public.treatments FOR ALL USING (public.is_admin());
CREATE POLICY "treatment_vet_all" ON public.treatments FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- clinical_assessments: admin all, vet own patients
CREATE POLICY "assessment_admin_all" ON public.clinical_assessments FOR ALL USING (public.is_admin());
CREATE POLICY "assessment_vet_all" ON public.clinical_assessments FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- treatment_outcomes: admin all, vet own patients
CREATE POLICY "outcome_admin_all" ON public.treatment_outcomes FOR ALL USING (public.is_admin());
CREATE POLICY "outcome_vet_all" ON public.treatment_outcomes FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- lab_results: admin all, vet own patients, reviewed_by vet
CREATE POLICY "lab_admin_all" ON public.lab_results FOR ALL USING (public.is_admin());
CREATE POLICY "lab_vet_all" ON public.lab_results FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);
CREATE POLICY "lab_reviewed_read" ON public.lab_results FOR SELECT USING (reviewed_by = auth.uid());

-- videos: admin all, uploader CRUD, vet own patients read
CREATE POLICY "video_admin_all" ON public.videos FOR ALL USING (public.is_admin());
CREATE POLICY "video_uploader_all" ON public.videos FOR ALL USING (uploaded_by = auth.uid());
CREATE POLICY "video_vet_read" ON public.videos FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- clinical_notes: admin all, vet own patients
CREATE POLICY "note_admin_all" ON public.clinical_notes FOR ALL USING (public.is_admin());
CREATE POLICY "note_vet_all" ON public.clinical_notes FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- adverse_events: admin all, vet own patients, serious AE readable by admin
CREATE POLICY "ae_admin_all" ON public.adverse_events FOR ALL USING (public.is_admin());
CREATE POLICY "ae_vet_all" ON public.adverse_events FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- protocol_deviations: admin all, vet own patients
CREATE POLICY "deviation_admin_all" ON public.protocol_deviations FOR ALL USING (public.is_admin());
CREATE POLICY "deviation_vet_all" ON public.protocol_deviations FOR ALL USING (
    veterinarian_id = auth.uid() AND
    patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- monitoring_visits: admin all, site vet read
CREATE POLICY "visit_admin_all" ON public.monitoring_visits FOR ALL USING (public.is_admin());
CREATE POLICY "visit_site_vet_read" ON public.monitoring_visits FOR SELECT USING (
    site_id IN (SELECT id FROM public.sites WHERE veterinarian_id = auth.uid())
);

-- drug_shipments: admin all, site vet read, shipment vet read
CREATE POLICY "shipment_admin_all" ON public.drug_shipments FOR ALL USING (public.is_admin());
CREATE POLICY "shipment_site_vet_read" ON public.drug_shipments FOR SELECT USING (
    site_id IN (SELECT id FROM public.sites WHERE veterinarian_id = auth.uid())
);
CREATE POLICY "shipment_vet_read" ON public.drug_shipments FOR SELECT USING (veterinarian_id = auth.uid());

-- bottle_inventory: admin all, site vet read, dispensing vet read
CREATE POLICY "bottle_admin_all" ON public.bottle_inventory FOR ALL USING (public.is_admin());
CREATE POLICY "bottle_site_vet_read" ON public.bottle_inventory FOR SELECT USING (
    site_id IN (SELECT id FROM public.sites WHERE veterinarian_id = auth.uid())
);
CREATE POLICY "bottle_dispensing_vet_read" ON public.bottle_inventory FOR SELECT USING (
    dispensed_to_patient_id IN (SELECT id FROM public.patients WHERE veterinarian_id = auth.uid() AND deleted_at IS NULL)
);

-- storage_confirmations: admin all, site vet CRUD
CREATE POLICY "storage_admin_all" ON public.storage_confirmations FOR ALL USING (public.is_admin());
CREATE POLICY "storage_site_vet_all" ON public.storage_confirmations FOR ALL USING (
    site_id IN (SELECT id FROM public.sites WHERE veterinarian_id = auth.uid())
);

-- fda_correspondence: admin all, monitor read
CREATE POLICY "fda_admin_all" ON public.fda_correspondence FOR ALL USING (public.is_admin());
CREATE POLICY "fda_monitor_read" ON public.fda_correspondence FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.administrators WHERE id = auth.uid() AND role = 'monitor' AND deleted_at IS NULL)
);

-- audit_logs: admin all, self writes (via triggers)
CREATE POLICY "audit_admin_all" ON public.audit_logs FOR ALL USING (public.is_admin());
-- Users can only see their own audit entries
CREATE POLICY "audit_self_read" ON public.audit_logs FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER veterinarians_updated_at BEFORE UPDATE ON public.veterinarians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER study_settings_updated_at BEFORE UPDATE ON public.study_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER clinical_notes_updated_at BEFORE UPDATE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER adverse_events_updated_at BEFORE UPDATE ON public.adverse_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER monitoring_visits_updated_at BEFORE UPDATE ON public.monitoring_visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER drug_shipments_updated_at BEFORE UPDATE ON public.drug_shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER bottle_inventory_updated_at BEFORE UPDATE ON public.bottle_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER storage_confirmations_updated_at BEFORE UPDATE ON public.storage_confirmations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    action_type audit_action;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Determine action type
    IF (TG_OP = 'INSERT') THEN
        action_type := 'create';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'UPDATE') THEN
        action_type := 'update';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        action_type := 'delete';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

    -- Insert audit log
    INSERT INTO public.audit_logs (
        user_id,
        user_email,
        user_role,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        session_id
    ) VALUES (
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        CASE
            WHEN public.is_admin() THEN 'admin'
            WHEN public.is_vet() THEN 'vet'
            ELSE 'unknown'
        END,
        action_type,
        TG_TABLE_NAME,
        CASE
            WHEN OLD.id IS NOT NULL THEN OLD.id
            WHEN NEW.id IS NOT NULL THEN NEW.id
            ELSE NULL
        END,
        old_data,
        new_data,
        current_setting('request.jwt.claims', true)::jsonb->>'session_id'
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach audit triggers to all clinical tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN ('audit_logs', 'study_settings', 'protocol_versions', 'administrators', 'veterinarians', 'sites')
    LOOP
        EXECUTE format('
            CREATE TRIGGER %s_audit
            AFTER INSERT OR UPDATE OR DELETE ON public.%s
            FOR EACH ROW EXECUTE FUNCTION public.audit_trigger()
        ', tbl, tbl);
    END LOOP;
END;
$$;

-- ============================================================
-- AUTO-NUMBERING FOR PATIENT_NUMBER
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_patient_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    IF NEW.patient_number IS NULL OR NEW.patient_number = '' THEN
        SELECT COALESCE(MAX(NULLIF(patient_number, '')::INTEGER), 0) + 1
        INTO next_num
        FROM public.patients
        WHERE patient_number ~ '^\d+$';
        NEW.patient_number := LPAD(next_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER patient_number_trigger
BEFORE INSERT ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.generate_patient_number();

-- ============================================================
-- AUTO-NUMBERING FOR AE_NUMBER
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_ae_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    next_num INTEGER;
    year_prefix TEXT;
BEGIN
    IF NEW.ae_number IS NULL OR NEW.ae_number = '' THEN
        year_prefix := 'AE-' || EXTRACT(YEAR FROM NEW.onset_date)::TEXT || '-';
        SELECT COALESCE(MAX(NULLIF(SUBSTRING(ae_number FROM year_prefix || '(\d+)'), '')::INTEGER), 0) + 1
        INTO next_num
        FROM public.adverse_events
        WHERE ae_number LIKE year_prefix || '%';
        NEW.ae_number := year_prefix || LPAD(next_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER ae_number_trigger
BEFORE INSERT ON public.adverse_events
FOR EACH ROW EXECUTE FUNCTION public.generate_ae_number();

-- ============================================================
-- AUTO-NUMBERING FOR SHIPMENT_NUMBER
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_shipment_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
        SELECT COALESCE(MAX(NULLIF(shipment_number, '')::INTEGER), 0) + 1
        INTO next_num
        FROM public.drug_shipments
        WHERE shipment_number ~ '^\d+$';
        NEW.shipment_number := LPAD(next_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER shipment_number_trigger
BEFORE INSERT ON public.drug_shipments
FOR EACH ROW EXECUTE FUNCTION public.generate_shipment_number();

-- ============================================================
-- BOTTLE_NUMBER GENERATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_bottle_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.bottle_number IS NULL OR NEW.bottle_number = '' THEN
        NEW.bottle_number := 'BTL-' || gen_random_uuid()::TEXT;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER bottle_number_trigger
BEFORE INSERT ON public.bottle_inventory
FOR EACH ROW EXECUTE FUNCTION public.generate_bottle_number();

-- ============================================================
-- SEED DATA (uses the Auth UUIDs created above)
-- ============================================================

-- Insert Administrator profile
INSERT INTO public.administrators (id, email, full_name, role)
VALUES (
    'ccb4a074-b438-4cd7-b591-5d0922fff58e',
    'drdsp@pm.me',
    'Dr. Daniel Shanahan-Prendergast',
    'super_admin'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    deleted_at = NULL;

-- Insert Veterinarian profile
INSERT INTO public.veterinarians (id, email, full_name, license_number, status, approved_at)
VALUES (
    '83ee08a6-9f55-4901-9e2c-1b6572f9160a',
    'phyto2002@gmail.com',
    'Dr. Test Veterinarian',
    'VET-TEST-001',
    'approved',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    license_number = EXCLUDED.license_number,
    status = EXCLUDED.status,
    approved_at = EXCLUDED.approved_at,
    deleted_at = NULL;

-- Study Settings
INSERT INTO public.study_settings (inad_number, protocol_version, sponsor_name, study_title, principal_investigator)
VALUES (
    'INAD-PTP102-2025',
    '1.0',
    'Byrock Technologies Ltd',
    'PTP-102 Laminitis Clinical Trial',
    'Dr. Daniel Shanahan-Prendergast'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS (run in Storage section or via dashboard)
-- ============================================================
-- These need to be created via Supabase Dashboard > Storage or Management API
-- Buckets: consents, videos, documents, exports
-- RLS policies below assume buckets exist

-- ============================================================
-- STORAGE RLS POLICIES (apply after buckets created)
-- ============================================================
-- Example for 'consents' bucket:
-- CREATE POLICY "consents_vet_upload" ON storage.objects FOR INSERT
--     TO authenticated WITH CHECK (bucket_id = 'consents' AND (public.is_vet() OR public.is_admin()));
-- CREATE POLICY "consents_vet_read" ON storage.objects FOR SELECT
--     TO authenticated USING (bucket_id = 'consents' AND (public.is_vet() OR public.is_admin()));
-- CREATE POLICY "consents_owner_read" ON storage.objects FOR SELECT
--     TO authenticated USING (bucket_id = 'consents' AND owner = auth.uid());

-- ============================================================
-- REALTIME PUBLICATION (for real-time updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE
    public.patients,
    public.treatments,
    public.clinical_assessments,
    public.adverse_events,
    public.protocol_deviations,
    public.drug_shipments,
    public.bottle_inventory;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these after to verify:
-- SELECT * FROM public.administrators;
-- SELECT * FROM public.veterinarians;
-- SELECT * FROM public.study_settings;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';