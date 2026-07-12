import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../../hooks/use-auth';
import { getAllPatients, getPatientsForVet } from '../../lib/api';
import Spinner from '../../components/ui/spinner';
import Button from '../../components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { role, vet } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = role === 'admin' ? await getAllPatients() : await getPatientsForVet(vet?.id ?? '');
        if (!cancelled) setPatients(list ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load patients');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, vet?.id]);

  return (
    <DashboardLayout title="PTP-102 Regulatory Platform">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">Patient Registry</h2>
            <p className="text-xs text-ink-500">{patients.length} patient{patients.length === 1 ? '' : 's'} total</p>
          </div>
          <Button onClick={() => navigate(role === 'admin' ? '/admin/deal-room' : '/vet/deal-room')}>
            Open Deal Room
          </Button>
        </div>

        {error && <div className="text-sm text-red-700">{error}</div>}

        <div className="panel overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-ink-500">
              <Spinner size={18} />
              <span>Loading patients...</span>
            </div>
          ) : patients.length === 0 ? (
            <EmptyState title="No patients yet" description="Patients will appear here once they are added to the trial." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">Horse</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-white/60 cursor-pointer transition-colors" onClick={() => navigate(`/admin/patients`)}>
                      <td className="px-4 py-3 font-medium text-ink-900">{p.patient_number ?? '—'}</td>
                      <td className="px-4 py-3 text-ink-700">{p.horse_name ?? '—'}</td>
                      <td className="px-4 py-3 text-ink-700">{p.status ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-10 text-center">
      <div className="text-sm font-medium text-ink-900">{title}</div>
      <p className="mt-1 text-xs text-ink-500">{description}</p>
    </div>
  );
}
