import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { getSites, getStudySettings, updateStudySettings, getAllVeterinarians, approveVeterinarian, suspendVeterinarian, updateUserPassword, sendPasswordResetEmail, ADMIN_CREDENTIAL_HINT } from '../../lib/api';
import { Settings as SettingsIcon, AlertCircle, Shield, Database, CheckCircle, KeyRound, Mail } from 'lucide-react';

type Tab = 'study' | 'vets' | 'integrations' | 'compliance' | 'credentials';

export default function Settings() {
  const { role: _role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [settings, setSettings] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [_sites, setSites] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, siteList, vetList] = await Promise.all([getStudySettings(), getSites(), getAllVeterinarians()]);
      setSettings(s);
      setSites(siteList ?? []);
      setVets(vetList ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateStudySettings({ ...(settings as any), updated_at: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h2 className="font-medium text-lg">Study Settings & Admin</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('study')} className={`px-3 py-1.5 rounded text-sm ${activeTab === 'study' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-800'}`}>Study</button>
          <button onClick={() => setActiveTab('vets')} className={`px-3 py-1.5 rounded text-sm ${activeTab === 'vets' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-800'}`}>Vets</button>
          <button onClick={() => setActiveTab('integrations')} className={`px-3 py-1.5 rounded text-sm ${activeTab === 'integrations' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-800'}`}>Integrations</button>
          <button onClick={() => setActiveTab('compliance')} className={`px-3 py-1.5 rounded text-sm ${activeTab === 'compliance' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-800'}`}>Compliance</button>
              <button onClick={() => setActiveTab('credentials')} className={`px-3 py-1.5 rounded text-sm ${activeTab === 'credentials' ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-800'}`}>Credentials</button>
        </div>
      </div>

      <div className="border border-slate-800 rounded-md p-4">
        {activeTab === 'study' && (
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2"><Database className="h-4 w-4"/> Study Configuration</h3>
            {settings && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="text-sm text-slate-300">Study Name</span>
                  <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={settings.study_name ?? ''} onChange={e => setSettings({ ...(settings as any), study_name: e.target.value })} /></label>
                <label className="block"><span className="text-sm text-slate-300">Protocol #</span>
                  <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={settings.protocol_number ?? ''} onChange={e => setSettings({ ...(settings as any), protocol_number: e.target.value })} /></label>
                <label className="block"><span className="text-sm text-slate-300">Sponsor</span>
                  <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={settings.sponsor_name ?? ''} onChange={e => setSettings({ ...(settings as any), sponsor_name: e.target.value })} /></label>
                <label className="block"><span className="text-sm text-slate-300">Indication</span>
                  <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={settings.indication ?? ''} onChange={e => setSettings({ ...(settings as any), indication: e.target.value })} /></label>
                <label className="block"><span className="text-sm text-slate-300">Phase</span>
                  <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={settings.phase ?? ''} onChange={e => setSettings({ ...(settings as any), phase: e.target.value })} /></label>
                <label className="block"><span className="text-sm text-slate-300">FDA IND #</span>
                  <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={settings.fda_ind_number ?? ''} onChange={e => setSettings({ ...(settings as any), fda_ind_number: e.target.value })} /></label>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              {saved && <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="h-4 w-4"/> Saved</span>}
              <button onClick={saveSettings} disabled={saving} className="px-4 py-2 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50">Save Settings</button>
            </div>
          </div>
        )}

        {activeTab === 'vets' && (
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2"><Shield className="h-4 w-4"/> Veterinarian Approvals</h3>
            <div className="space-y-2">
              {vets.map((vet: any) => (
                <div key={vet.id} className="flex items-center justify-between border border-slate-800 rounded p-3">
                  <div>
                    <div className="font-medium">{vet.full_name}</div>
                    <div className="text-xs text-slate-400">{vet.license_state} · {vet.license_number}</div>
                  </div>
                  <div className="flex gap-2">
                    {vet.status === 'pending' && (
                      <>
                        <button onClick={() => approveVeterinarian(vet.id, 'admin')} className="px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-900">Approve</button>
                        <button onClick={() => suspendVeterinarian(vet.id)} className="px-2 py-1 rounded border border-red-900/40 text-red-300 text-xs font-medium">Reject</button>
                      </>
                    )}
                    {vet.status === 'approved' && <span className="text-xs text-green-400">Approved</span>}
                    {vet.status === 'suspended' && <span className="text-xs text-red-400">Suspended</span>}
                  </div>
                </div>
              ))}
              {vets.length === 0 && <div className="text-sm text-slate-400">No veterinarians.</div>}
            </div>
          </div>
        )}

        {activeTab !== 'study' && activeTab !== 'vets' && activeTab !== 'credentials' && (
          <div className="py-8 text-center text-slate-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel placeholder.</p>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <h3 className="font-medium flex items-center gap-2"><KeyRound className="h-4 w-4"/> Admin Credentials</h3>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Current Account Details</h4>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs mb-1">Email</span>
                  <span className="font-mono text-slate-200">{user?.email ?? 'drdsp@pm.me'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1">Password hint (last 4 chars)</span>
                  <span className="font-mono text-slate-200">{ADMIN_CREDENTIAL_HINT}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-3">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2"><Mail className="h-4 w-4"/> Reset via Email</h4>
              <CredentialResetEmail />
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Change Password Now</h4>
              <ChangePasswordForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────
function CredentialResetEmail() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('drdsp@pm.me');

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError('');
    setBusy(true);
    try { await sendPasswordResetEmail(email); setSent(true); }
    catch (err: any) { setError(err.message ?? 'Failed to send reset email.'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-2 max-w-sm">
      {sent
        ? <p className="text-xs text-green-400">Reset link sent. Check your inbox.</p>
        : <>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <input className="w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-950 text-sm" value={email} onChange={e => setEmail(e.target.value)} />
            <button type="submit" disabled={busy} className="px-3 py-1.5 rounded bg-slate-100 text-xs font-medium text-slate-900 disabled:opacity-50">{busy ? 'Sending...' : 'Send Reset Link'}</button>
          </>
      }
    </form>
  );
}

function ChangePasswordForm() {
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (newPass.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    if (newPass !== confirm) { setMsg('Passwords do not match.'); return; }
    setBusy(true);
    try { await updateUserPassword(newPass); setMsg('Password updated successfully.'); setNewPass(''); setConfirm(''); }
    catch (err: any) { setMsg(err.message ?? 'Update failed.'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-2 max-w-sm">
      {msg && <p className={"text-xs " + (msg.includes("success") ? "text-green-400" : "text-red-400")}>{msg}</p>}
      <label className="block text-xs text-slate-400">New password
        <input type="password" className="mt-1 w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-950 text-sm" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8} />
      </label>
      <label className="block text-xs text-slate-400">Confirm
        <input type="password" className="mt-1 w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-950 text-sm" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </label>
      <button type="submit" disabled={busy} className="px-3 py-1.5 rounded bg-slate-100 text-xs font-medium text-slate-900 disabled:opacity-50">{busy ? 'Updating...' : 'Change Password'}</button>
    </form>
  );
}

