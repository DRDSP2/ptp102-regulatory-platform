import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../../hooks/use-auth';
import { getAllPatients, getPatientsForVet } from '../../lib/api';

export default function Dashboard() {
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
        <h2 className="text-lg font-medium">Patient Registry</h2>
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
