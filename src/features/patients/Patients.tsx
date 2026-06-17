import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import {
  getAllPatients,
  getPatientsForVet,
  getPatientById,
  createPatient,
  updatePatient,
  softDeletePatient,
  lockPatient,
  freezePatient,
} from '../../lib/api';
import { Plus, Search, Filter, MoreVertical, Lock, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';

type PatientStatus = 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn' | 'locked' | 'frozen';

const statusColors: Record<PatientStatus, string> = {
  screening: 'bg-amber-900/30 text-amber-300',
  enrolled: 'bg-blue-900/30 text-blue-300',
  active: 'bg-green-900/30 text-green-300',
  completed: 'bg-slate-900/30 text-slate-300',
  withdrawn: 'bg-red-900/30 text-red-300',
  locked: 'bg-purple-900/30 text-purple-300',
  frozen: 'bg-indigo-900/30 text-indigo-300',
};

export default function Patients() {
  const { role, vet } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Form state
  const [form, setForm] = useState({
    horse_name: '',
    breed: '',
    age_years: '',
    age_months: '',
    sex: 'gelding',
    weight_kg: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    site_id: '',
  });

  useEffect(() => {
    loadPatients();
  }, [role, vet]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const list = role === 'admin' ? await getAllPatients() : await getPatientsForVet(vet?.id ?? '');
      setPatients(list);
    } catch (err) {
      console.error('Load patients error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.horse_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, form);
      } else {
        await createPatient({ ...form, veterinarian_id: vet?.id });
      }
      setShowModal(false);
      setEditingPatient(null);
      resetForm();
      loadPatients();
    } catch (err) {
      console.error('Save patient error:', err);
      alert('Failed to save patient');
    }
  };

  const resetForm = () => {
    setForm({
      horse_name: '',
      breed: '',
      age_years: '',
      age_months: '',
      sex: 'gelding',
      weight_kg: '',
      owner_name: '',
      owner_phone: '',
      owner_email: '',
      site_id: '',
    });
  };

  const openEdit = (patient: any) => {
    setEditingPatient(patient);
    setForm({
      horse_name: patient.horse_name,
      breed: patient.breed || '',
      age_years: patient.age_years?.toString() || '',
      age_months: patient.age_months?.toString() || '',
      sex: patient.sex || 'gelding',
      weight_kg: patient.weight_kg?.toString() || '',
      owner_name: patient.owner_name,
      owner_phone: patient.owner_phone || '',
      owner_email: patient.owner_email || '',
      site_id: patient.site_id || '',
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingPatient(null);
    resetForm();
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('This will soft-delete the patient. Continue?')) return;
    try {
      await softDeletePatient(id);
      loadPatients();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete');
    }
  };

  const handleLock = async (id: string) => {
    if (!confirm('Lock this patient record? This prevents further edits.')) return;
    try {
      await lockPatient(id, vet?.id ?? '');
      loadPatients();
    } catch (err) {
      console.error('Lock error:', err);
      alert('Failed to lock');
    }
  };

  const handleFreeze = async (id: string) => {
    if (!confirm('Freeze this patient record? This is a regulatory action.')) return;
    try {
      await freezePatient(id, vet?.id ?? '');
      loadPatients();
    } catch (err) {
      console.error('Freeze error:', err);
      alert('Failed to freeze');
    }
  };

  const viewPatient = async (id: string) => {
    try {
      const patient = await getPatientById(id);
      setSelectedPatient(patient);
    } catch (err) {
      console.error('View error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">Patient Registry</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 rounded border border-slate-800 bg-slate-950 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="screening">Screening</option>
            <option value="enrolled">Enrolled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="locked">Locked</option>
            <option value="frozen">Frozen</option>
          </select>
          {role === 'admin' || role === 'vet' ? (
            <button onClick={openNew} className="flex items-center gap-1.5 rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-200">
              <Plus className="h-4 w-4" />
              Add Patient
            </button>
          ) : null}
        </div>
      </div>

      <div className="border border-slate-800 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-800">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Patient #</th>
              <th className="px-3 py-2 text-left font-medium">Horse Name</th>
              <th className="px-3 py-2 text-left font-medium">Owner</th>
              <th className="px-3 py-2 text-left font-medium">Veterinarian</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Enrolled</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : filteredPatients.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">No patients found</td></tr>
            ) : (
              filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-slate-900/50">
                  <td className="px-3 py-2 font-mono text-slate-300">{p.patient_number}</td>
                  <td className="px-3 py-2">{p.horse_name}</td>
                  <td className="px-3 py-2 text-slate-400">{p.owner_name}</td>
                  <td className="px-3 py-2 text-slate-400">{p.veterinarians?.full_name || 'N/A'}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[p.status as PatientStatus] || 'bg-slate-900/30 text-slate-300'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-400">{p.enrollment_date ? new Date(p.enrollment_date).toLocaleDateString() : '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => viewPatient(p.id)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                        title="View details"
                      ><Eye className="h-4 w-4" /></button>
                      {(role === 'admin' || role === 'vet') && (
                        <>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                            title="Edit"
                          ><Edit className="h-4 w-4" /></button>
                          {p.status !== 'locked' && p.status !== 'frozen' && (
                            <button
                              onClick={() => handleLock(p.id)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-300"
                              title="Lock record"
                            ><Lock className="h-4 w-4" /></button>
                          )}
                          {p.status !== 'frozen' && role === 'admin' && (
                            <button
                              onClick={() => handleFreeze(p.id)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-300"
                              title="Freeze (regulatory)"
                            ><AlertTriangle className="h-4 w-4" /></button>
                          )}
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                            title="Soft delete"
                          ><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPatient(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">{selectedPatient.horse_name} — #{selectedPatient.patient_number}</h3>
              <button onClick={() => setSelectedPatient(null)} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-400">Breed:</span> <span className="ml-2">{selectedPatient.breed || '—'}</span></div>
                <div><span className="text-slate-400">Age:</span> <span className="ml-2">{selectedPatient.age_years}y {selectedPatient.age_months}m</span></div>
                <div><span className="text-slate-400">Sex:</span> <span className="ml-2 capitalize">{selectedPatient.sex}</span></div>
                <div><span className="text-slate-400">Weight:</span> <span className="ml-2">{selectedPatient.weight_kg} kg</span></div>
                <div className="col-span-2"><span className="text-slate-400">Owner:</span> <span className="ml-2">{selectedPatient.owner_name} ({selectedPatient.owner_email || 'no email'})</span></div>
                <div className="col-span-2"><span className="text-slate-400">Veterinarian:</span> <span className="ml-2">{selectedPatient.veterinarians?.full_name}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Site:</span> <span className="ml-2">{selectedPatient.sites?.name || '—'}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Status:</span> <span className="ml-2 capitalize">{selectedPatient.status}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Enrolled:</span> <span className="ml-2">{selectedPatient.enrollment_date ? new Date(selectedPatient.enrollment_date).toLocaleDateString() : 'Not enrolled'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowModal(false); setEditingPatient(null); resetForm(); }}>
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-medium">{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); resetForm(); }} className="p-1 rounded hover:bg-slate-800">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-slate-300">Horse Name *</span>
                  <input required value={form.horse_name} onChange={e => setForm({...form, horse_name: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Breed</span>
                  <input value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Age (years)</span>
                  <input type="number" min="0" value={form.age_years} onChange={e => setForm({...form, age_years: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Age (months)</span>
                  <input type="number" min="0" max="11" value={form.age_months} onChange={e => setForm({...form, age_months: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Sex *</span>
                  <select value={form.sex} onChange={e => setForm({...form, sex: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="gelding">Gelding</option>
                    <option value="stallion">Stallion</option>
                    <option value="mare">Mare</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Weight (kg)</span>
                  <input type="number" step="0.1" min="0" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-slate-300">Owner Name *</span>
                  <input required value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Owner Email *</span>
                  <input type="email" required value={form.owner_email} onChange={e => setForm({...form, owner_email: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Owner Phone</span>
                  <input value={form.owner_phone} onChange={e => setForm({...form, owner_phone: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Site</span>
                  <input value={form.site_id} onChange={e => setForm({...form, site_id: e.target.value})} className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" placeholder="Site UUID" />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null); resetForm(); }} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200">
                  {editingPatient ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}