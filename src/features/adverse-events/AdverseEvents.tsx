import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import {
  getAllPatients,
  getAEsForPatient,
  createAE,
  updateAE,
  submitFdaReport,
} from '../../lib/api';
import { Plus, AlertTriangle, FileText, Send, AlertCircle, Edit } from 'lucide-react';

type AESeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal';
type AERelationship = 'unrelated' | 'unlikely' | 'possible' | 'probable' | 'definite';
type AEOutcome = 'recovered' | 'recovering' | 'not_recovered' | 'fatal' | 'unknown';

const severityColors: Record<AESeverity, string> = {
  mild: 'bg-green-900/30 text-green-300',
  moderate: 'bg-amber-900/30 text-amber-300',
  severe: 'bg-orange-900/30 text-orange-300',
  life_threatening: 'bg-red-900/30 text-red-300',
  fatal: 'bg-red-900/50 text-red-200',
};

const outcomeColors: Record<AEOutcome, string> = {
  recovered: 'bg-green-900/30 text-green-300',
  recovering: 'bg-blue-900/30 text-blue-300',
  not_recovered: 'bg-amber-900/30 text-amber-300',
  fatal: 'bg-red-900/30 text-red-300',
  unknown: 'bg-slate-900/30 text-slate-300',
};

export default function AdverseEvents() {
  const { vet } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [aes, setAEs] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAE, setEditingAE] = useState<any | null>(null);
  const [reportingAE, setReportingAE] = useState<any | null>(null);

  // Form state
  const [form, setForm] = useState({
    patient_id: '',
    ae_term: '',
    severity: 'mild' as AESeverity,
    relationship: 'possible' as AERelationship,
    onset_date: new Date().toISOString().split('T')[0],
    resolution_date: '',
    outcome: 'unknown' as AEOutcome,
    description: '',
    action_taken: '',
    treatment_change: false,
    serious: false,
    expected: false,
  });

  const loadPatients = async () => {
    try {
      const list = await getAllPatients();
      setPatients(list);
    } catch (err) {
      console.error('Load patients error:', err);
    }
  };

  const loadAEs = async (patientId: string) => {
    try {
      const list = await getAEsForPatient(patientId);
      setAEs(list);
    } catch (err) {
      console.error('Load AEs error:', err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setForm({ ...form, patient_id: patient.id });
    loadAEs(patient.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAE) {
        await updateAE(editingAE.id, form);
      } else {
        await createAE(form);
      }
      setShowModal(false);
      setEditingAE(null);
      resetForm();
      if (selectedPatient) loadAEs(selectedPatient.id);
    } catch (err) {
      console.error('Save AE error:', err);
      alert('Failed to save adverse event');
    }
  };

  const resetForm = () => {
    setForm({
      patient_id: selectedPatient?.id || '',
      ae_term: '',
      severity: 'mild',
      relationship: 'possible',
      onset_date: new Date().toISOString().split('T')[0],
      resolution_date: '',
      outcome: 'unknown',
      description: '',
      action_taken: '',
      treatment_change: false,
      serious: false,
      expected: false,
    });
  };

  const openNew = () => {
    if (!selectedPatient) { alert('Select a patient first'); return; }
    setEditingAE(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (ae: any) => {
    setEditingAE(ae);
    setForm({
      patient_id: ae.patient_id,
      ae_term: ae.ae_term,
      severity: ae.severity,
      relationship: ae.relationship,
      onset_date: ae.onset_date?.split('T')[0] || '',
      resolution_date: ae.resolution_date?.split('T')[0] || '',
      outcome: ae.outcome,
      description: ae.description,
      action_taken: ae.action_taken,
      treatment_change: ae.treatment_change,
      serious: ae.serious,
      expected: ae.expected,
    });
    setShowModal(true);
  };

  const handleFDAReport = async (ae: any, type = 'initial') => {
    try {
      setReportingAE(ae);
      const narrative = prompt('Enter narrative for FDA report (optional):') || undefined;
      const result = await submitFdaReport(ae.id, type, narrative);
      alert(`FDA report submitted: ${JSON.stringify(result)}`);
    } catch (err) {
      console.error('FDA report error:', err);
      alert('Failed to submit FDA report');
    } finally {
      setReportingAE(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Adverse Event Reporter</h2>
          <p className="text-sm text-slate-400">21 CFR Part 11 compliant AE tracking with FDA E2B(R3) export capability.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200">
          <Plus className="h-4 w-4" />
          Report AE
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Patient Selector */}
        <div className="lg:col-span-1 border border-slate-800 rounded-md overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-medium text-sm">Select Patient</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <ul className="divide-y divide-slate-800">
              {patients.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => handlePatientSelect(p)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                      selectedPatient?.id === p.id ? 'bg-slate-800' : ''
                    }`}
                  >
                    <div className="font-mono text-slate-300">#{p.patient_number}</div>
                    <div className="truncate">{p.horse_name}</div>
                    <div className="text-xs text-slate-500">{p.owner_name}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AE List + Form */}
        <div className="lg:col-span-2 border border-slate-800 rounded-md overflow-hidden">
          {selectedPatient ? (
            <div className="flex flex-col h-[600px] overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <h3 className="font-medium text-sm">
                  {selectedPatient.horse_name} — #{selectedPatient.patient_number}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {aes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <AlertTriangle className="h-12 w-12 mb-3" />
                    <p>No adverse events reported for this patient.</p>
                    <p className="text-xs">Click "Report AE" to add one.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {aes.map(ae => (
                      <li key={ae.id} className="border border-slate-800 rounded p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{ae.ae_term}</span>
                              <span className={`px-1.5 py-0.5 rounded text-xs ${severityColors[ae.severity as AESeverity]}`}>
                                {ae.severity.replace('_', ' ')}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-xs ${outcomeColors[ae.outcome as AEOutcome]}`}>
                                {ae.outcome.replace('_', ' ')}
                              </span>
                              {ae.serious && (
                                <span className="px-1.5 py-0.5 rounded text-xs bg-red-900/30 text-red-300 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> SERIOUS
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-4">
                              <span>Onset: {ae.onset_date ? new Date(ae.onset_date).toLocaleDateString() : '—'}</span>
                              <span>Relationship: {ae.relationship}</span>
                              {ae.report_status && <span>FDA: {ae.report_status}</span>}
                            </div>
                            {ae.description && <p className="text-sm text-slate-300 mt-2 line-clamp-2">{ae.description}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(ae)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100" title="Edit"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleFDAReport(ae, 'initial')} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-300" title="Submit Initial FDA Report">
                              <Send className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleFDAReport(ae, 'followup')} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-300" title="Submit Follow-up">
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400">
              <AlertTriangle className="h-12 w-12 mb-3" />
              <p>Select a patient to view and report adverse events.</p>
              <p className="text-xs">AEs are linked to the PTP-102 INAD study protocol.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit AE Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowModal(false); setEditingAE(null); resetForm(); }}>
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">{editingAE ? 'Edit Adverse Event' : 'Report New Adverse Event'}</h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingAE(null); resetForm(); }} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {selectedPatient && (
                <div className="p-3 bg-slate-900/50 rounded border border-slate-800 text-sm">
                  <span className="font-medium">{selectedPatient.horse_name}</span> — <span className="font-mono">#{selectedPatient.patient_number}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-slate-300">AE Term (MedDRA preferred term) *</span>
                  <input required value={form.ae_term} onChange={e => setForm({...form, ae_term: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" placeholder="e.g., Laminitis, Colic, Injection site reaction" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Severity *</span>
                  <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value as AESeverity})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="life_threatening">Life Threatening</option>
                    <option value="fatal">Fatal</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Relationship to PTP-102 *</span>
                  <select value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value as AERelationship})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="unrelated">Unrelated</option>
                    <option value="unlikely">Unlikely</option>
                    <option value="possible">Possible</option>
                    <option value="probable">Probable</option>
                    <option value="definite">Definite</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Outcome *</span>
                  <select value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value as AEOutcome})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="recovered">Recovered</option>
                    <option value="recovering">Recovering</option>
                    <option value="not_recovered">Not Recovered</option>
                    <option value="fatal">Fatal</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Onset Date *</span>
                  <input type="date" required value={form.onset_date} onChange={e => setForm({...form, onset_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Resolution Date</span>
                  <input type="date" value={form.resolution_date} onChange={e => setForm({...form, resolution_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-slate-300">Description *</span>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" placeholder="Detailed clinical description of the adverse event..." />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Action Taken</span>
                <textarea value={form.action_taken} onChange={e => setForm({...form, action_taken: e.target.value})} rows={2} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.treatment_change} onChange={e => setForm({...form, treatment_change: e.target.checked})} className="rounded border-slate-700" />
                  <span className="text-sm text-slate-300">Treatment Changed</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.serious} onChange={e => setForm({...form, serious: e.target.checked})} className="rounded border-slate-700" />
                  <span className="text-sm text-slate-300">Serious (SAE)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.expected} onChange={e => setForm({...form, expected: e.target.checked})} className="rounded border-slate-700" />
                  <span className="text-sm text-slate-300">Expected per Protocol</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => { setShowModal(false); setEditingAE(null); resetForm(); }} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                  {editingAE ? 'Update' : 'Report AE'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}