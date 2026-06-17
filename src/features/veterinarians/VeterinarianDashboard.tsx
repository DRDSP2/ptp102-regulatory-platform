import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Plus, Stethoscope } from 'lucide-react';

type Tab = 'patients' | 'assessments' | 'treatments' | 'labs' | 'videos';

const initialForms = {
  assessment: { assessment_date: '', visit_type: 'scheduled', aaep_score: '', aaep_grade: '', lameness_grade: '', hoof_tester_score: '', digital_pulse_score: '', pain_score: '', joint_flexion_score: '', radiographic_score: '', ultrasound_score: '', notes: '' },
  treatment: { treatment_number: 1, treatment_date: '', drug_name: 'PTP-102', dose: '', route: 'IV', batch_number: '', lot_expiry: '', administered_by: '', notes: '' },
  lab: { sample_date: '', sample_type: 'blood', test_panel: '', results_json: '{}', reference_ranges_json: '{}', lab_facility: '', status: 'pending' },
  video: { video_type: 'gait_analysis', title: '', description: '', storage_path: '', duration_seconds: 0, file_size_mb: 0 },
};

export default function VeterinarianDashboard() {
  const { vet, user } = useAuth();
  const [vetProfile, setVetProfile] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('patients');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientData, setPatientData] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<keyof typeof initialForms | null>(null);
  const [currentForm, setCurrentForm] = useState<any>({});
  const formsRef = useRef(initialForms);

  const loadVetProfile = useCallback(async () => {
    if (!vet?.id) return;
    try {
      const profile = await getVeterinarian(vet.id);
      setVetProfile(profile);
    } catch (err) {
      console.error('Load vet profile error:', err);
    }
  }, [vet?.id]);

  const loadPatients = useCallback(async () => {
    if (!vet?.id) return;
    try {
      const list = await getPatientsForVet(vet.id);
      setPatients(list);
    } catch (err) {
      console.error('Load patients error:', err);
    } finally {
      setLoading(false);
    }
  }, [vet?.id]);

  useEffect(() => {
    if (vet?.id) {
      loadVetProfile();
      loadPatients();
    }
  }, [vet?.id, loadVetProfile, loadPatients]);

  const loadPatientData = useCallback(async (patientId: string) => {
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
  }, []);

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    loadPatientData(patient.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !formType || !vet?.id) return;

    try {
      const payload = { ...currentForm, patient_id: selectedPatient.id, veterinarian_id: vet.id };

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

  const resetForm = (type: keyof typeof initialForms) => {
    const today = new Date().toISOString().split('T')[0];
    const baseForm = { ...formsRef.current[type] };
    if (type === 'assessment') {
      baseForm.assessment_date = today;
      baseForm.administered_by = vet?.full_name;
    } else if (type === 'treatment') {
      baseForm.treatment_date = today;
      baseForm.administered_by = vet?.full_name;
    } else if (type === 'lab') {
      baseForm.sample_date = today;
    }
    setCurrentForm(baseForm);
  };

  const openForm = (type: keyof typeof initialForms) => {
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

      {/* Tab Navigation */}
      <div className="border border-slate-800 rounded-t-md">
        <div className="flex overflow-x-auto border-b border-slate-800">
          {(['patients', 'assessments', 'treatments', 'labs', 'videos'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab
                  ? 'border-slate-100 text-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
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
                onClick={() => openForm(activeTab as keyof typeof initialForms)}
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
                        <button className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100">👁</button>
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

        {/* Form Modal */}
        {showModal && formType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-900 border border-slate-800 rounded-lg">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-medium">{formType.charAt(0).toUpperCase() + formType.slice(1)} — {selectedPatient?.horse_name}</h3>
                <button onClick={() => { setShowModal(false); setFormType(null); }} className="text-slate-400 hover:text-slate-100">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {(() => {
                  const f = currentForm;
                  if (formType === 'assessment') return (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block"><span className="text-sm text-slate-300">Date</span><input type="date" value={f.assessment_date} onChange={e => setCurrentForm({...f, assessment_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Visit Type</span><select value={f.visit_type} onChange={e => setCurrentForm({...f, visit_type: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"><option value="scheduled">Scheduled</option><option value="unscheduled">Unscheduled</option></select></label>
                        <label className="block"><span className="text-sm text-slate-300">AAEP Score</span><input type="number" value={f.aaep_score} onChange={e => setCurrentForm({...f, aaep_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">AAEP Grade</span><input type="text" value={f.aaep_grade} onChange={e => setCurrentForm({...f, aaep_grade: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Lameness Grade (0-5)</span><input type="number" min="0" max="5" value={f.lameness_grade} onChange={e => setCurrentForm({...f, lameness_grade: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Hoof Tester Score</span><input type="number" value={f.hoof_tester_score} onChange={e => setCurrentForm({...f, hoof_tester_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Digital Pulse Score</span><input type="number" value={f.digital_pulse_score} onChange={e => setCurrentForm({...f, digital_pulse_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Pain Score (1-10)</span><input type="number" min="1" max="10" value={f.pain_score} onChange={e => setCurrentForm({...f, pain_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Joint Flexion Score</span><input type="number" value={f.joint_flexion_score} onChange={e => setCurrentForm({...f, joint_flexion_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Radiographic Score</span><input type="number" value={f.radiographic_score} onChange={e => setCurrentForm({...f, radiographic_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Ultrasound Score</span><input type="number" value={f.ultrasound_score} onChange={e => setCurrentForm({...f, ultrasound_score: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Notes</span><textarea value={f.notes} onChange={e => setCurrentForm({...f, notes: e.target.value})} rows={3} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Administered By</span><input type="text" value={f.administered_by} onChange={e => setCurrentForm({...f, administered_by: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                      </div>
                    </>
                  );
                  if (formType === 'treatment') return (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block"><span className="text-sm text-slate-300">Treatment #</span><input type="number" value={f.treatment_number} onChange={e => setCurrentForm({...f, treatment_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Date</span><input type="date" value={f.treatment_date} onChange={e => setCurrentForm({...f, treatment_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Drug Name</span><input type="text" value={f.drug_name} onChange={e => setCurrentForm({...f, drug_name: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Dose</span><input type="text" value={f.dose} onChange={e => setCurrentForm({...f, dose: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Route</span><select value={f.route} onChange={e => setCurrentForm({...f, route: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"><option value="IV">IV</option><option value="IM">IM</option><option value="SC">SC</option><option value="PO">PO</option></select></label>
                        <label className="block"><span className="text-sm text-slate-300">Batch Number</span><input type="text" value={f.batch_number} onChange={e => setCurrentForm({...f, batch_number: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Lot Expiry</span><input type="date" value={f.lot_expiry} onChange={e => setCurrentForm({...f, lot_expiry: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Administered By</span><input type="text" value={f.administered_by} onChange={e => setCurrentForm({...f, administered_by: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Notes</span><textarea value={f.notes} onChange={e => setCurrentForm({...f, notes: e.target.value})} rows={3} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                      </div>
                    </>
                  );
                  if (formType === 'lab') return (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block"><span className="text-sm text-slate-300">Sample Date</span><input type="date" value={f.sample_date} onChange={e => setCurrentForm({...f, sample_date: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Sample Type</span><select value={f.sample_type} onChange={e => setCurrentForm({...f, sample_type: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"><option value="blood">Blood</option><option value="synovial">Synovial Fluid</option><option value="urine">Urine</option><option value="other">Other</option></select></label>
                        <label className="block"><span className="text-sm text-slate-300">Test Panel</span><input type="text" value={f.test_panel} onChange={e => setCurrentForm({...f, test_panel: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Lab Facility</span><input type="text" value={f.lab_facility} onChange={e => setCurrentForm({...f, lab_facility: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Status</span><select value={f.status} onChange={e => setCurrentForm({...f, status: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Results (JSON)</span><textarea value={f.results_json} onChange={e => setCurrentForm({...f, results_json: e.target.value})} rows={3} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 font-mono text-sm" /></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Reference Ranges (JSON)</span><textarea value={f.reference_ranges_json} onChange={e => setCurrentForm({...f, reference_ranges_json: e.target.value})} rows={3} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 font-mono text-sm" /></label>
                      </div>
                    </>
                  );
                  if (formType === 'video') return (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block"><span className="text-sm text-slate-300">Video Type</span><select value={f.video_type} onChange={e => setCurrentForm({...f, video_type: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"><option value="gait_analysis">Gait Analysis</option><option value="lameness_exam">Lameness Exam</option><option value="treadmill">Treadmill</option></select></label>
                        <label className="block"><span className="text-sm text-slate-300">Title</span><input type="text" value={f.title} onChange={e => setCurrentForm({...f, title: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">Duration (seconds)</span><input type="number" value={f.duration_seconds} onChange={e => setCurrentForm({...f, duration_seconds: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block"><span className="text-sm text-slate-300">File Size (MB)</span><input type="number" step="0.1" value={f.file_size_mb} onChange={e => setCurrentForm({...f, file_size_mb: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Description</span><textarea value={f.description} onChange={e => setCurrentForm({...f, description: e.target.value})} rows={3} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                        <label className="block sm:col-span-2"><span className="text-sm text-slate-300">Storage Path / URL</span><input type="text" value={f.storage_path} onChange={e => setCurrentForm({...f, storage_path: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" /></label>
                      </div>
                    </>
                  );
                  return null;
                })()}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => { setShowModal(false); setFormType(null); }} className="px-4 py-2 rounded border border-slate-800 hover:bg-slate-800">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-slate-100 text-slate-900 font-medium">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}