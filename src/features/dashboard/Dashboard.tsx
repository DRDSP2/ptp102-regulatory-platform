import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../../hooks/use-auth';
import { getAllPatients, getPatientsForVet } from '../../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { role, vet } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = role === 'admin' ? await getAllPatients() : await getPatientsForVet(vet?.id ?? '');
        setPatients(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [role, vet]);

  return (
    <DashboardLayout title="PTP-102 Regulatory Platform">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Patient Registry</h2>
          <button
            onClick={() => navigate(role === 'admin' ? '/admin/deal-room' : '/vet/deal-room')}
            className="inline-flex items-center gap-2 rounded bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/20 text-[10px]">🚪</span>
            Deal Room
          </button>
        </div>
        {loading ? <p className="text-sm text-slate-400">Loading patients...</p> : null}
        {!loading && patients.length === 0 ? <p className="text-sm text-slate-400">No patients found.</p> : null}
        <ul className="space-y-2">
          {patients.map((p) => (
            <li key={p.id} className="border border-slate-800 rounded p-3 text-sm">{p.patient_number} — {p.horse_name} — {p.status}</li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
