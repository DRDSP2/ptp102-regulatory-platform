import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function VeterinarianDashboard() {
  const navigate = useNavigate();
  const [vetId, setVetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [tab, setTab] = useState<'overview' | 'treatments' | 'labs'>('overview');
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      const uid = session?.user?.id ?? null;
      setVetId(uid);
      if (!uid) { setLoading(false); return; }
      const { data: vet } = await supabase.from('veterinarians').select('id').eq('auth_user_id', uid).single();
      const vid = vet?.id ?? uid;
      const [pData, aData, tData, lData] = await Promise.all([
        supabase.from('patients').select('*, sites(*)').eq('veterinarian_id', vid).is('deleted_at', null),
        supabase.from('clinical_assessments').select('*').eq('veterinarian_id', vid).order('assessment_date', { ascending: false }).limit(50),
        supabase.from('treatments').select('*').eq('veterinarian_id', vid).order('treatment_date', { ascending: false }).limit(50),
        supabase.from('lab_results').select('*').eq('veterinarian_id', vid).order('sample_date', { ascending: false }).limit(50),
      ]);
      if (cancelled) return;
      setPatients(pData.data ?? []);
      setAssessments(aData.data ?? []);
      setTreatments(tData.data ?? []);
      setLabs(lData.data ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const openPatient = (p: any) => {
    setSelected(p);
    setTab('overview');
  };

  const saveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !vetId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('clinical_assessments').insert({
        ...assessmentForm,
        patient_id: selected.id,
        veterinarian_id: vetId,
        assessment_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      setShowAssessment(false);
      const { data } = await supabase.from('clinical_assessments').select('*').eq('patient_id', selected.id).order('assessment_date', { ascending: false });
      setAssessments(data ?? []);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-ink-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Veterinarian Dashboard</h2>
        <button
          onClick={() => navigate('/vet/deal-room')}
          className="inline-flex items-center gap-2 rounded bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/20 text-[10px]">🚪</span>
          Deal Room
        </button>
      </div>
      {!selected ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border border-ink-200 rounded-xl p-4">
              <div className="text-sm text-ink-500">Total Patients</div>
              <div className="text-2xl font-medium">{patients.length}</div>
            </div>
            <div className="border border-ink-200 rounded-xl p-4">
              <div className="text-sm text-ink-500">Assessments (30d)</div>
              <div className="text-2xl font-medium">{assessments.length}</div>
            </div>
            <div className="border border-ink-200 rounded-xl p-4">
              <div className="text-sm text-ink-500">Active Treatments</div>
              <div className="text-2xl font-medium">{treatments.filter((t: any) => !t.completed_at).length}</div>
            </div>
          </div>
          <div className="border border-ink-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-200 font-medium">My Patients</div>
            {patients.length === 0 ? (
              <div className="p-8 text-center text-ink-500">No patients assigned yet.</div>
            ) : (
              <div className="divide-y divide-ink-200">
                {patients.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-white/60 cursor-pointer" onClick={() => openPatient(p)}>
                    <div>
                      <div className="font-medium">{p.horse_name}</div>
                      <div className="text-xs text-ink-500">{p.breed} · {p.site_id ? 'Site ' + p.site_id.slice(0,6) : 'No site'}</div>
                    </div>
                    <div className="text-sm text-ink-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="text-sm text-ink-500 hover:text-ink-800">← Back</button>
              <h2 className="text-lg font-medium">{selected.horse_name}</h2>
            </div>
            <button onClick={() => setShowAssessment(true)} className="px-3 py-1.5 rounded bg-ink-100 text-sm font-medium text-ink-900">New Assessment</button>
          </div>
          <div className="flex border-b border-ink-200">
            {(['overview', 'treatments', 'labs'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === t ? 'border-slate-100 text-ink-900 bg-white/60' : 'border-transparent text-ink-500'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
          {tab === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assessments.filter((a: any) => a.patient_id === selected.id).map(a => (
                <div key={a.id} className="border border-ink-200 rounded p-3">
                  <div className="text-sm font-medium mb-1">Assessment {a.assessment_date}</div>
                  <div className="text-xs text-ink-500">
                    Visit: {a.visit_type || '—'} · AAEP: {a.aaep_score || '—'}/{a.aaep_grade || '—'} · Pain: {a.pain_score || '—'}
                  </div>
                  {a.notes && <div className="text-xs text-ink-500 mt-1">{a.notes}</div>}
                </div>
              ))}
            </div>
          )}
          {tab === 'treatments' && (
            <div className="space-y-2">
              {treatments.filter((t: any) => t.patient_id === selected.id).map(t => (
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
              {labs.filter((l: any) => l.patient_id === selected.id).map(l => (
                <div key={l.id} className="border border-ink-200 rounded p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{l.test_name}</div>
                    <div className="text-xs text-ink-500">Sample: {l.sample_date} · Result: {l.result}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAssessment && selected && (
        <form onSubmit={saveAssessment} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAssessment(false)}>
          <div className="bg-white border border-ink-200 rounded-xl w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">New Assessment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="text-sm text-ink-600">Visit Type</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.visit_type ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, visit_type: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">AAEP Score</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.aaep_score ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, aaep_score: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">AAEP Grade</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.aaep_grade ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, aaep_grade: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Lameness Grade</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.lameness_grade ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, lameness_grade: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Pain Score (0–10)</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.pain_score ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, pain_score: e.target.value })} /></label>
              <label className="block"><span className="text-sm text-ink-600">Radiographic Score</span>
                <input className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.radiographic_score ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, radiographic_score: e.target.value })} /></label>
              <label className="block sm:col-span-2"><span className="text-sm text-ink-600">Notes</span>
                <textarea className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5" value={assessmentForm.notes ?? ''} onChange={e => setAssessmentForm({ ...assessmentForm, notes: e.target.value })} /></label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAssessment(false)} className="px-4 py-2 rounded border border-ink-200">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-ink-100 text-sm font-medium text-ink-900">Save</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
