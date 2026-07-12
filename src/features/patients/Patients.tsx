import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { getAllPatients, softDeletePatient, getSites, getAssessmentsForPatient, getTreatmentsForPatient, getLabsForPatient, getConsentForms, getAdverseEventsForPatient } from '../../lib/api';

type Tab = 'overview' | 'assessments' | 'treatments' | 'labs' | 'consent' | 'ae';
type PatientRow = { id: string; horse_name: string; breed: string | null; age_years: number | null; age_months: number | null; sex: string | null; weight_kg: number | null; owner_name: string; owner_phone: string | null; owner_email: string | null; site_id: string | null; veterinarian_id: string | null; created_at: string | null };

export default function Patients() {
  const { /* role */ _ } = useAuth();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PatientRow | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PatientRow | null>(null);
  const [form, setForm] = useState({ horse_name: '', breed: '', age_years: '', age_months: '', sex: '', weight_kg: '', owner_name: '', owner_phone: '', owner_email: '', site_id: '', veterinarian_id: '' });
  const [rows, setRows] = useState<Record<string, any>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([getAllPatients(), getSites()]);
      setPatients((p ?? []) as any);
      setSites(s ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const open = async (p: PatientRow) => {
    setSelected(p);
    setTab('overview');
    const [assessments, treatments, labs, consent, aes] = await Promise.all([
      getAssessmentsForPatient(p.id),
      getTreatmentsForPatient(p.id),
      getLabsForPatient(p.id),
      getConsentForms(p.id),
      getAdverseEventsForPatient(p.id),
    ]);
    setRows({ assessments: assessments ?? [], treatments: treatments ?? [], labs: labs ?? [], consent: consent ?? [], aes: aes ?? [] });
  };

  const reset = () => {
    setForm({ horse_name: '', breed: '', age_years: '', age_months: '', sex: '', weight_kg: '', owner_name: '', owner_phone: '', owner_email: '', site_id: '', veterinarian_id: '' });
    setEditing(null);
    setShowModal(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, age_years: form.age_years === '' ? null : Number(form.age_years), age_months: form.age_months === '' ? null : Number(form.age_months), weight_kg: form.weight_kg === '' ? null : Number(form.weight_kg) } as any;
      if (editing) await updatePatient(editing.id, payload);
      else await createPatient(payload);
      await load();
      reset();
    } catch (err) { console.error(err); }
  };

  const remove = async (p: PatientRow) => {
    if (!confirm('Delete this patient record?')) return;
    await softDeletePatient(p.id);
    if (selected?.id === p.id) setSelected(null);
    await load();
  };

  if (loading) return <div className="p-4 text-ink-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Patients</h2>
        <button onClick={() => { reset(); setShowModal(true); }} className="px-3 py-1.5 rounded bg-ink-100 text-sm font-medium text-ink-900">New Patient</button>
      </div>

      <div className="border border-ink-200 rounded-xl overflow-hidden">
        {patients.length === 0 ? (
          <div className="p-8 text-center text-ink-500">No patients recorded</div>
        ) : (
          <div className="divide-y divide-ink-200">
            {patients.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-white/60 cursor-pointer" onClick={() => open(p)}>
                <div>
                  <div className="font-medium">{p.horse_name}</div>
                  <div className="text-xs text-ink-500">{p.breed || '—'} · {p.sex || '—'} · {p.weight_kg ?? '—'} kg</div>
                </div>
                <div className="text-sm text-ink-500">{p.owner_name || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="border border-ink-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{selected.horse_name}</h3>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="px-3 py-1.5 rounded border border-ink-200 text-sm">Close</button>
              <button onClick={() => { setEditing(selected); setForm({ horse_name: selected.horse_name, breed: selected.breed ?? '', age_years: selected.age_years?.toString() ?? '', age_months: selected.age_months?.toString() ?? '', sex: selected.sex ?? '', weight_kg: selected.weight_kg?.toString() ?? '', owner_name: selected.owner_name ?? '', owner_phone: selected.owner_phone ?? '', owner_email: selected.owner_email ?? '', site_id: selected.site_id ?? '', veterinarian_id: selected.veterinarian_id ?? '' }); setShowModal(true); }} className="px-3 py-1.5 rounded bg-ink-100 text-sm font-medium text-ink-900">Edit</button>
              <button onClick={() => remove(selected)} className="px-3 py-1.5 rounded border border-ink-200 text-sm text-red-300">Delete</button>
            </div>
          </div>

          <div className="flex gap-4 text-sm text-ink-500">
            <div>Age: {selected.age_years ?? 0}y {selected.age_months ?? 0}m</div>
            <div>Weight: {selected.weight_kg ?? '—'} kg</div>
            <div>Owner: {selected.owner_name || '—'}</div>
          </div>

          <div className="flex border-b border-ink-200">
            {(['overview', 'assessments', 'treatments', 'labs', 'consent', 'ae'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === t ? 'border-slate-100 text-ink-900 bg-white/60' : 'border-transparent text-ink-500'}`}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="border border-ink-200 rounded p-3"><div className="text-xs text-ink-500">Assessments</div><div className="text-xl font-medium">{rows.assessments?.length ?? 0}</div></div>
              <div className="border border-ink-200 rounded p-3"><div className="text-xs text-ink-500">Treatments</div><div className="text-xl font-medium">{rows.treatments?.length ?? 0}</div></div>
              <div className="border border-ink-200 rounded p-3"><div className="text-xs text-ink-500">Lab Results</div><div className="text-xl font-medium">{rows.labs?.length ?? 0}</div></div>
            </div>
          )}

          {tab === 'treatments' && (
            <div className="space-y-2">
              {(rows.treatments ?? []).map((t: any) => (
                <div key={t.id} className="border border-ink-200 rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{t.drug_name} · {t.dose} {t.route}</div>
                    <div className="text-xs text-ink-500">Date: {t.treatment_date} · Admin: {t.administered_by}</div>
                  </div>
                  {t.batch_number && <div className="text-xs font-mono text-ink-600">{t.batch_number}</div>}
                </div>
              ))}
            </div>
          )}

          {tab === 'labs' && (
            <div className="space-y-2">
              {(rows.labs ?? []).map((l: any) => (
                <div key={l.id} className="border border-ink-200 rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{l.test_name}</div>
                    <div className="text-xs text-ink-500">Sample: {l.sample_date} · Result: {l.result}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'consent' && (
            <div className="space-y-2">
              {(rows.consent ?? []).map((c: any) => (
                <div key={c.id} className="border border-ink-200 rounded p-3">
                  <div className="text-sm font-medium">Consent {c.form_type || ''}</div>
                  <div className="text-xs text-ink-500">Status: {c.status || '—'} · Date: {c.signed_at ? new Date(c.signed_at).toLocaleString() : '—'}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'ae' && (
            <div className="space-y-2">
              {(rows.aes ?? []).map((a: any) => (
                <div key={a.id} className="border border-ink-200 rounded p-3">
                  <div className="text-sm font-medium">AE {a.ae_number || a.id}</div>
                  <div className="text-xs text-ink-500">Term: {a.ae_term || '—'} · Severity: {a.severity || '—'} · Serious: {a.serious ? 'Yes' : 'No'}</div>
                  {a.description && <div className="text-xs text-ink-500 mt-1">{a.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <form onSubmit={save} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={reset}>
          <div className="bg-white border border-ink-200 rounded-xl w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">{editing ? 'Edit Patient' : 'New Patient'}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="text-sm text-ink-600">Horse Name *</span>
                <input required className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.horse_name} onChange={(e) => setForm({ ...form, horse_name: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Breed</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Age (years)</span>
                <input type="number" min="0" className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.age_years} onChange={(e) => setForm({ ...form, age_years: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Age (months)</span>
                <input type="number" min="0" max="11" className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.age_months} onChange={(e) => setForm({ ...form, age_months: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Sex</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Weight (kg)</span>
                <input type="number" step="0.1" min="0" className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Owner Name *</span>
                <input required className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Owner Phone</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Owner Email</span>
                <input type="email" className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Site</span>
                <select className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={form.site_id} onChange={(e) => setForm({ ...form, site_id: e.target.value })}>
                  <option value="">None</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={reset} className="px-4 py-2 rounded border border-ink-200">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-ink-100 text-sm font-medium text-ink-900">Save</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
