-- ============================================================
-- PTP-102 Seed Data for Demo Accounts
-- ============================================================
-- Prerequisites:
--  - Supabase project created
--  - Auth enabled
--  - schema.sql applied
--
-- Needed before running this:
--   1) Create auth users via Supabase Dashboard / Auth API:
--      - phyto2002@gmail.com / Test123456
--      - drdsp@pm.me / PTP102
--   2) Copy the returned UUIDs into the statements below
-- ============================================================
-- -------------------------------------------------
-- Study Settings
-- -------------------------------------------------
INSERT INTO public.study_settings
    (inad_number, protocol_version, sponsor_name, study_title, principal_investigator)
VALUES
    (
        'INAD-PTP102-2025',
        '1.0',
        'Byrock Technologies Ltd',
        'PTP-102 Laminitis Clinical Trial',
        'Dr. Daniel Shanahan-Prendergast'
    );

-- -------------------------------------------------
-- Seed: Test Veterinarian
-- Replace UUID with the real auth.users id from signup
-- -------------------------------------------------
INSERT INTO public.veterinarians
    (id, email, full_name, license_number, status, approved_at)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'phyto2002@gmail.com',
        'Dr. Test Veterinarian',
        'VET-TEST-001',
        'approved',
        NOW()
    );

-- -------------------------------------------------
-- Seed: Administrator
-- Replace UUID with the real auth.users id from signup
-- -------------------------------------------------
INSERT INTO public.administrators
    (id, email, full_name, role)
VALUES
    (
        '00000000-0000-0000-0000-000000000002',
        'drdsp@pm.me',
        'Dr. Daniel Shanahan-Prendergast',
        'super_admin'
    );
