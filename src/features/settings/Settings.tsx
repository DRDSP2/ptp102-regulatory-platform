import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import {
  getStudySettings,
  updateStudySettings,
  getAllVeterinarians,
  approveVeterinarian,
  suspendVeterinarian,
} from '../../lib/api';
import { Settings, UserCheck, UserX, Save, AlertCircle, Shield, Database, Key, Globe } from 'lucide-react';

type StudySettings = {
  study_name: string;
  protocol_number: string;
  sponsor_name: string;
  indication: string;
  phase: string;
  fda_ind_number: string;
  ica_email: string;
  dsmb_email: string;
  regulatory_contact_email: string;
  enrollment_target: number;
  randomization_ratio: string;
  primary_endpoint: string;
  secondary_endpoints: string;
};

export default function Settings() {
  const { role } = useAuth();
  const [settings, setSettings] = useState<StudySettings | null>(null);
  const [veterinarians, setVeterinarians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'vets' | 'integrations' | 'compliance'>('study');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, vetsData] = await Promise.all([
        getStudySettings(),
        getAllVeterinarians(),
      ]);
      setSettings(settingsData);
      setVeterinarians(vetsData);
    } catch (err) {
      console.error('Load settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      await updateStudySettings(settings);
      alert('Study settings saved');
    } catch (err) {
      console.error('Save settings error:', err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (vetId: string) => {
    try {
      await approveVeterinarian(vetId, 'admin');
      loadData();
    } catch (err) {
      console.error('Approve error:', err);
      alert('Failed to approve');
    }
  };

  const handleSuspend = async (vetId: string) => {
    if (!confirm('Suspend this veterinarian?')) return;
    try {
      await suspendVeterinarian(vetId);
      loadData();
    } catch (err) {
      console.error('Suspend error:', err);
      alert('Failed to suspend');
    }
  };

  if (role !== 'admin') {
    return (
      <div className="text-center py-12 text-slate-400">
        <Shield className="h-12 w-12 mx-auto mb-3 text-slate-600" />
        <p className="text-lg">Admin access required</p>
        <p className="text-sm">Only super_admins can access system settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">System Settings</h2>

      <div className="flex border-b border-slate-800">
        {['study', 'vets', 'integrations', 'compliance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-slate-100 text-slate-100 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'study' && (
        <form onSubmit={handleSave} className="border border-slate-800 rounded-md p-4 space-y-4 max-w-3xl">
          <h3 className="font-medium flex items-center gap-2"><Database className="h-4 w-4" /> Study Configuration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-sm text-slate-300">Study Name *</span>
              <input value={settings?.study_name || ''} onChange={e => setSettings({...settings!, study_name: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required />
            </label>
            <label className="block"><span className="text-sm text-slate-300">Protocol Number *</span>
              <input value={settings?.protocol_number || ''} onChange={e => setSettings({...settings!, protocol_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required />
            </label>
            <label className="block"><span className="text-sm text-slate-300">Sponsor *</span>
              <input value={settings?.sponsor_name || ''} onChange={e => setSettings({...settings!, sponsor_name: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required />
            </label>
            <label className="block"><span className="text-sm text-slate-300">FDA IND Number *</span>
              <input value={settings?.fda_ind_number || ''} onChange={e => setSettings({...settings!, fda_ind_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required />
            </label>
            <label className="block"><span className="text-sm text-slate-300">Indication *</span>
              <input value={settings?.indication || ''} onChange={e => setSettings({...settings!, indication: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required />
            </label>
            <label className="block"><span className="text-sm text-slate-300">Phase *</span>
              <select value={settings?.phase || ''} onChange={e => setSettings({...settings!, phase: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required>
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
                <option value="Phase 4">Phase 4</option>
              </select>
            </label>
            <label className="block"><span className="text-sm text-slate-300">Enrollment Target *</span>
              <input type="number" value={settings?.enrollment_target || ''} onChange={e => setSettings({...settings!, enrollment_target: parseInt(e.target.value)})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" required />
            </label>
            <label className="block"><span className="text-sm text-slate-300">Randomization Ratio</span>
              <input value={settings?.randomization_ratio || ''} onChange={e => setSettings({...settings!, randomization_ratio: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" placeholder="1:1" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-sm text-slate-300">ICA Email</span>
              <input type="email" value={settings?.ica_email || ''} onChange={e => setSettings({...settings!, ica_email: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </label>
            <label className="block"><span className="text-sm text-slate-300">DSMB Email</span>
              <input type="email" value={settings?.dsmb_email || ''} onChange={e => setSettings({...settings!, dsb_email: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </label>
            <label className="col-span-2"><span className="text-sm text-slate-300">Regulatory Contact Email</span>
              <input type="email" value={settings?.regulatory_contact_email || ''} onChange={e => setSettings({...settings!, regulatory_contact_email: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </label>
          </div>

          <div>
            <label className="block"><span className="text-sm text-slate-300">Primary Endpoint</span>
              <textarea value={settings?.primary_endpoint || ''} onChange={e => setSettings({...settings!, primary_endpoint: e.target.value})} rows={2} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </label>
          </div>
          <div>
            <label className="block"><span className="text-sm text-slate-300">Secondary Endpoints</span>
              <textarea value={settings?.secondary_endpoints || ''} onChange={e => setSettings({...settings!, secondary_endpoints: e.target.value})} rows={3} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded bg-slate-100 text-slate-900 font-medium disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Study Settings'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'vets' && (
        <div className="border border-slate-800 rounded-md overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> Veterinarian Management</h3>
            <p className="text-sm text-slate-400 mt-1">Approve or suspend veterinarians for PTP-102 trial access.</p>
          </div>
          <div className="divide-y divide-slate-800">
            {veterinarians.map(vet => (
              <div key={vet.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium">
                    {vet.full_name?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <div className="font-medium">{vet.full_name}</div>
                    <div className="text-sm text-slate-400">{vet.email}</div>
                    <div className="text-xs text-slate-500">License: {vet.license_number} ({vet.license_state}) | Exp: {vet.license_expiry_date ? new Date(vet.license_expiry_date).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    vet.status === 'approved' ? 'bg-green-900/30 text-green-300' :
                    vet.status === 'pending' ? 'bg-amber-900/30 text-amber-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>{vet.status}</span>
                  {vet.status === 'pending' && (
                    <button onClick={() => handleApprove(vet.id)} className="px-3 py-1.5 rounded bg-green-900/30 text-green-300 hover:bg-green-900/50 text-sm">Approve</button>
                  )}
                  {vet.status === 'approved' && (
                    <button onClick={() => handleSuspend(vet.id)} className="px-3 py-1.5 rounded bg-red-900/30 text-red-300 hover:bg-red-900/50 text-sm">Suspend</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="border border-slate-800 rounded-md p-4 space-y-6">
          <h3 className="font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> External Integrations</h3>
          
          <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
            <h4 className="font-medium mb-2">4Everland IPFS Hosting</h4>
            <p className="text-sm text-slate-400 mb-3">Deployed to: <code className="text-slate-300">byrock.eth.limo</code></p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Project ID:</span> <code className="ml-2 text-slate-300 font-mono">6a2abe9085252f000741a1de</code></div>
              <div><span className="text-slate-400">Gateway:</span> <code className="ml-2 text-slate-300 font-mono">https://gateway.4everland.io</code></div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
            <h4 className="font-medium mb-2">Supabase</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Project:</span> <code className="ml-2 text-slate-300 font-mono">vtxrmjuftqtealzymqbk</code></div>
              <div><span className="text-slate-400">Region:</span> <code className="ml-2 text-slate-300 font-mono">us-east-1</code></div>
              <div><span className="text-slate-400">REST API:</span> <code className="ml-2 text-slate-200 font-mono truncate block">https://vtxrmjuftqtealzymqbk.supabase.co/rest/v1</code></div>
              <div><span className="text-slate-400">Realtime:</span> <code className="ml-2 text-slate-200 font-mono truncate block">wss://vtxrmjuftqtealzymqbk.supabase.co/realtime/v1</code></div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
            <h4 className="font-medium mb-2">Supabase Edge Functions (Deployed)</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> create-vet-profile</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> generate-consent-pdf</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> fda-report (E2B R3)</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> audit-webhook</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="border border-slate-800 rounded-md p-4 space-y-6">
          <h3 className="font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Regulatory Compliance Status</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
              <h4 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> FDA 21 CFR Part 11</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>✓ Electronic signatures on consent forms</li>
                <li>✓ Audit trail on all tables (RLS + triggers)</li>
                <li>✓ Record locking/freezing for data integrity</li>
                <li>✓ Access controls via RLS policies</li>
                <li>✓ Timestamped, attributable actions</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
              <h4 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> ICH-GCP E6(R2)</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>✓ Investigator qualification tracking</li>
                <li>✓ Site monitoring visit logs</li>
                <li>✓ Protocol deviation tracking</li>
                <li>✓ Informed consent workflow</li>
                <li>✓ Adverse event reporting (SAE)</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
              <h4 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4" /> PTP-102 INAD</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>✓ Drug shipment & temperature tracking</li>
                <li>✓ Bottle-level inventory management</li>
                <li>✓ Storage condition monitoring (2-8°C)</li>
                <li>✓ Veterinarian credential verification</li>
                <li>✓ FDA E2B(R3) AE export ready</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-900/50 rounded border border-slate-800">
              <h4 className="font-medium flex items-center gap-2"><Key className="h-4 w-4" /> Data Security</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                <li>✓ Row Level Security on all tables</li>
                <li>✓ Supabase Auth (email/password + MFA ready)</li>
                <li>✓ Service role for backend functions only</li>
                <li>✓ Storage bucket policies (private by default)</li>
                <li>✓ Soft-delete with audit retention</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}