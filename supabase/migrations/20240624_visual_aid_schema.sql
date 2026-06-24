-- PTP-102 Visual Aid Database Schema
-- Run this in Supabase SQL Editor

-- Horses table
CREATE TABLE IF NOT EXISTS horses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner TEXT,
    patient_id TEXT,
    admin_approved BOOLEAN DEFAULT false,
    trial_conducted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    horse_id UUID REFERENCES horses(id) ON DELETE CASCADE,
    hoof TEXT CHECK (hoof IN ('FL', 'FR', 'HL', 'HR')),
    view TEXT,
    modality TEXT DEFAULT 'DX',
    description TEXT,
    scan_date DATE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies — allow authenticated users full access
CREATE POLICY "Allow all access to horses" ON horses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to scans" ON scans FOR ALL USING (auth.role() = 'authenticated');

-- Insert seed data
INSERT INTO horses (name, owner, patient_id, admin_approved, trial_conducted) VALUES
('DUTCHESS OF HAZELBANK', 'FREEDOM FARM/HAZELBANK INC', 'DUTCHESS', true, true),
('AMBUSHKA', 'FREEDOM FARM', 'AMBUSHKA', true, true)
ON CONFLICT DO NOTHING;

-- Insert sample scans (update image URLs after uploading to Storage)
INSERT INTO scans (horse_id, hoof, view, modality, description, scan_date, image_url) VALUES
((SELECT id FROM horses WHERE name = 'DUTCHESS OF HAZELBANK'), 'FR', 'Lateral', 'DX', 'Right Fore Foot Lateral', '2025-08-21', NULL),
((SELECT id FROM horses WHERE name = 'DUTCHESS OF HAZELBANK'), 'FR', 'Lateral', 'DX', 'Right Fore Foot Lateral', '2025-12-08', NULL),
((SELECT id FROM horses WHERE name = 'DUTCHESS OF HAZELBANK'), 'FR', 'Lateral', 'DX', 'Right Fore Foot Lateral', '2026-01-26', NULL),
((SELECT id FROM horses WHERE name = 'DUTCHESS OF HAZELBANK'), 'FR', 'Lateral', 'DX', 'Right Fore Foot Lateral', '2026-06-22', NULL)
ON CONFLICT DO NOTHING;
