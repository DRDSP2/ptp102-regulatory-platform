import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import {
  getVeterinarian,
  getPatientsForVet,
  getAssessmentsForPatient,
  getTreatmentsForPatient,
  getLabsForPatient,
  getVideosForPatient,
  createAssessment,
  createTreatment,
  createLabResult,
  createVideo,
} from '../../lib/api';
import { Plus, Search, Filter, Eye, Edit, Upload, Calendar, Stethoscope, Pill, FlaskConical, Video } from 'lucide-react';

type Tab = 'patients' | 'assessments' | 'treatments' | 'labs' | 'videos';

export default function VeterinarianDashboard() {
  const { vet, user } = useAuth();
  const [vetProfile, setVetProfile] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('patients');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientData, setPatientData] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<keyof typeof forms | null>(null);

  const forms = {
    assessment: { assessment_date: '', visit_type: 'scheduled', aaep_score: '', aaep_grade: '', lameness_grade: '', hoof_tester_score: '', digital_pulse_score: '', pain_score: '', joint_flexion_score: '', radiographic_score: '', ultrasound_score: '', notes: '' },
    treatment: { treatment_number: 1, treatment_date: '', drug_name: 'PTP-102', dose: '', route: 'IV', batch_number: '', lot_expiry: '', administered_by: '', notes: '' },
    lab: { sample_date: '', sample_type: 'blood', test_panel: '', results_json: '{}', reference_ranges_json: '{}', lab_facility: '', status: 'pending' },
    video: { video_type: 'gait_analysis', title: '', description: '', storage_path: '', duration_seconds: 0, file_size_mb: 0 },
  };

  useEffect(() => {
    if (vet?.id) {
      loadVetProfile();
      loadPatients();
    }
  }, [vet?.id]);

  const loadVetProfile = async () => {
    try {
      const profile = await getVeterinarian(vet.id);
      setVetProfile(profile);
    } catch (err) {
      console.error('Load vet profile error:', err);
    }
  };

  const loadPatients = async () => {
    try {
      const list = await getPatientsForVet(vet?.id || '');
      setPatients(list);
    } catch (err) {
      console.error('Load patients error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (patientId: string) => {
    try {
      const [assessments, treatments, labs, videos] = await Promise.all([
        getAssessmentsForPatient(patientId),
        getTreatmentsForPatient(patientId),
        getLabsForPatient(patientId),
        getVideosForPatient(patientId),
      ]);
      setPatientData({ assessments, treatments, labs, videos });
    } catch (err) {
      console.error('Load patient data error:', err);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    loadPatientData(patient.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !formType) return;

    try {
      const formData = forms[formType as keyof typeof forms];
      const payload = { ...formData, patient_id: selectedPatient.id, veterinarian_id: vet?.id };

      if (formType === 'assessment') await createAssessment(payload);
      else if (formType === 'treatment') await createTreatment(payload);
      else if (formType === 'lab') await createLabResult(payload);
      else if (formType === 'video') await createVideo(payload);

      setShowModal(false);
      setFormType(null);
      loadPatientData(selectedPatient.id);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save');
    }
  };

  const resetForm = (type: keyof typeof forms) => {
    const today = new Date().toISOString().split('T')[0];
    if (type === 'assessment') {
      setForms({ ...forms, assessment: { ...forms.assessment, assessment_date: today, administered_by: vet?.full_name } });
    } else if (type === 'treatment') {
      setForms({ ...forms, treatment: { ...forms.treatment, treatment_date: today, administered_by: vet?.full_name } });
    } else if (type === 'lab') {
      setForms({ ...forms, lab: { ...forms.lab, sample_date: today } });
    } else if (type === 'video') {
      setForms({ ...forms, video: { ...forms.video } });
    }
  };

  const setForms = (newForms: typeof forms) => {
    // This is a workaround since we're using a single forms object
    Object.keys(newForms).forEach(key => {
      forms[key as keyof typeof forms] = newForms[key as keyof typeof forms];
    });
  };

  const openForm = (type: keyof typeof forms) => {
    if (!selectedPatient) { alert('Select a patient first'); return; }
    resetForm(type);
    setFormType(type);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="border border-slate-800 rounded-md p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-medium text-slate-300">
            {vetProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'V'}
          </div>
          <div>
            <h2 className="font-medium text-lg">{vetProfile?.full_name || 'Veterinarian'}</h2>
            <p className="text-sm text-slate-400">{vetProfile?.email}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span>License: {vetProfile?.license_number} ({vetProfile?.license_state})</span>
              <span>Expires: {vetProfile?.license_expiry_date ? new Date(vetProfile.license_expiry_date).toLocaleDateString() : 'N/A'}</span>
              <span className={`px-2 py-0.5 rounded ${vetProfile?.status === 'approved' ? 'bg-green-900/30 text-green-300' : 'bg-amber-900/30 text-amber-300'}`}>
                {vetProfile?.status || 'pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(['patients', 'assessments', 'treatments', 'labs', 'videos'] as Tab[]).map(tab => (
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

      {/* Content */}
      <div className="border border-slate-800 rounded-b-md overflow-hidden">
        {activeTab === 'patients' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">My Patients</h3>
              <div className="flex gap-2">
                <button onClick={() => openForm('assessment')} className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                  <Plus className="h-4 w-4 mr-1" /> Add Assessment
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center text-slate-400 py-8">Loading...</div>
            ) : patients.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p>No patients assigned yet.</p>
                <p className="text-xs">Patients will appear here when enrolled by admin.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePatientSelect(p)}
                    className={`p-4 border rounded text-left hover:bg-slate-900/50 transition ${
                      selectedPatient?.id === p.id ? 'border-slate-100 bg-slate-800' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{p.horse_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        p.status === 'active' ? 'bg-green-900/30 text-green-300' :
                        p.status === 'enrolled' ? 'bg-blue-900/30 text-blue-300' :
                        p.status === 'screening' ? 'bg-amber-900/30 text-amber-300' :
                        'bg-slate-900/30 text-slate-300'
                      }`}>{p.status}</span>
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>#{p.patient_number}</div>
                      <div>{p.owner_name}</div>
                      <div>Enrolled: {p.enrollment_date ? new Date(p.enrollment_date).toLocaleDateString() : 'Screening'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {['assessments', 'treatments', 'labs', 'videos'].includes(activeTab) && selectedPatient && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} — {selectedPatient.horse_name}</h3>
              <button
                onClick={() => openForm(activeTab as keyof typeof forms)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            {/* Data List */}
            <div className="space-y-2">
              {(() => {
                const dataList = patientData[activeTab + 's'] || [];
                if (dataList.length === 0) {
                  return <div className="text-center text-slate-400 py-8">No {activeTab} recorded yet.</div>;
                }
                return dataList.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="border border-slate-800 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        {activeTab === 'assessments' && (
                          <>
                            <div className="font-medium">AAEP Grade: {item.aaep_grade || '—'} | Lameness: {item.lameness_grade || '—'}</div>
                            <div className="text-sm text-slate-400">{item.visit_type} • {item.assessment_date ? new Date(item.assessment_date).toLocaleDateString() : '—'}</div>
                          </>
                        )}
                        {activeTab === 'treatments' && (
                          <>
                            <div className="font-medium">#{item.treatment_number} • {item.drug_name} {item.dose}{item.route}</div>
                            <div className="text-sm text-slate-400">{item.treatment_date ? new Date(item.treatment_date).toLocaleDateString() : '—'}</div>
                          </>
                        )}
                        {activeTab === 'labs' && (
                          <>
                            <div className="font-medium">{item.test_panel} ({item.sample_type})</div>
                            <div className="text-sm text-slate-400">{item.sample_date ? new Date(item.sample_date).toLocaleDateString() : '—'} • {item.status}</div>
                          </>
                        )}
                        {activeTab === 'videos' && (
                          <>
                            <div className="font-medium">{item.title} ({item.video_type})</div>
                            <div className="text-sm text-slate-400">{item.duration_seconds}s • {item.file_size_mb}MB</div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"><Eye className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {['assessments', 'treatments', 'labs', 'videos'].includes(activeTab) && !selectedPatient && (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
            <Stethoscope className="h-12 w-12 mb-3 text-slate-600" />
            <p>Select a patient from the Patients tab to view {activeTab}.</p>
          </div>
        )}
      </div>

      {/* Form Modals */}
      {showModal && formType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowModal(false); setFormType(null); }}>
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">Add {formType.charAt(0).toUpperCase() + formType.slice(1)}</h3>
              <button type="button" onClick={() => { setShowModal(false); setFormType(null); }} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {selectedPatient && (
                <div className="p-3 bg-slate-900/50 rounded border border-slate-800 text-sm">
                  <span className="font-medium">{selectedPatient.horse_name}</span> — <span className="font-mono">#{selectedPatient.patient_number}</span>
                </div>
              )}
              {(() => {
                const f = forms[formType];
                if (!f) return null;
                const fields = Object.entries(f);
                return (
                  <div className="grid grid-cols-2 gap-4">
                    {fields.map(([key, value]) => (
                      <label key={key} className={`block ${key.includes('notes') || key.includes('description') || key.includes('results_json') || key.includes('reference_ranges_json') ? 'col-span-2' : ''}`}>
                        <span className="text-sm text-slate-300">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}{key.includes('_date') || key.includes('_json') ? ' *' : ''}</span>
                        {key.includes('json') ? (
                          <textarea value={value} onChange={e => forms[formType!][key] = e.target.value} rows={4} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm font-mono text-xs" />
                        ) : key.includes('date') ? (
                          <input type="date" value={value} onChange={e => forms[formType!][key] = e.target.value} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                        ) : (
                          <input value={value} onChange={e => forms[formType!][key] = e.target.value} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                        )}
                      </label>
                    ))}
                  </div>
                );
              })()}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => { setShowModal(false); setFormType(null); }} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">Save</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}