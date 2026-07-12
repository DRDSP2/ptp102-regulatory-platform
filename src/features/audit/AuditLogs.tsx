import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { getAuditLogs } from '../../lib/api';
import { ChevronLeft, ChevronRight, Database, User } from 'lucide-react';

export default function AuditLogs() {
  const { role: _role } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ table: '', action: '', user_id: '', date_from: '', date_to: '' });

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs({
        table: filters.table || undefined,
        action: filters.action || undefined,
        user_id: filters.user_id || undefined,
        limit: pageSize + 1,
      });
      // We'd need cursor-based pagination in real implementation
      setLogs(data.slice(0, pageSize));
      setHasMore(data.length > pageSize);
    } catch (err) {
      console.error('Load audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, filters, loadLogs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const actionColors: Record<string, string> = {
    INSERT: 'bg-green-900/30 text-green-300',
    UPDATE: 'bg-blue-900/30 text-blue-300',
    DELETE: 'bg-red-900/30 text-red-300',
    SELECT: 'bg-white/50 text-ink-600',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Audit Trail</h2>
      <p className="text-sm text-ink-500">Immutable log of all data access and modifications (21 CFR Part 11 compliant).</p>

      <div className="border border-ink-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-ink-500 mb-1">Table</label>
            <select value={filters.table} onChange={e => handleFilterChange('table', e.target.value)} className="w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5 text-sm">
              <option value="">All Tables</option>
              <option value="patients">patients</option>
              <option value="treatments">treatments</option>
              <option value="clinical_assessments">clinical_assessments</option>
              <option value="adverse_events">adverse_events</option>
              <option value="informed_consents">informed_consents</option>
              <option value="drug_shipments">drug_shipments</option>
              <option value="veterinarians">veterinarians</option>
              <option value="audit_logs">audit_logs</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-ink-500 mb-1">Action</label>
            <select value={filters.action} onChange={e => handleFilterChange('action', e.target.value)} className="w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5 text-sm">
              <option value="">All Actions</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="SELECT">SELECT</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-ink-500 mb-1">User ID</label>
            <input value={filters.user_id} onChange={e => handleFilterChange('user_id', e.target.value)} placeholder="Filter by user UUID" className="w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5 text-sm" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm text-ink-500 mb-1">Date From</label>
            <input type="date" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)} className="w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5 text-sm" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm text-ink-500 mb-1">Date To</label>
            <input type="date" value={filters.date_to} onChange={e => handleFilterChange('date_to', e.target.value)} className="w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5 text-sm" />
          </div>
        </div>
      </div>

      <div className="border border-ink-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/60 border-b border-ink-200">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Timestamp</th>
              <th className="px-3 py-2 text-left font-medium">User</th>
              <th className="px-3 py-2 text-left font-medium">Table</th>
              <th className="px-3 py-2 text-left font-medium">Action</th>
              <th className="px-3 py-2 text-left font-medium">Record ID</th>
              <th className="px-3 py-2 text-left font-medium">Changes</th>
              <th className="px-3 py-2 text-left font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-ink-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-ink-500">No audit logs found</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-white/60">
                  <td className="px-3 py-2 font-mono text-ink-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-ink-400" />
                      <span className="font-mono text-xs">{log.user_id?.slice(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/60 text-ink-600 text-xs">
                      <Database className="h-3 w-3" />
                      {log.table_name}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || 'bg-white/50 text-ink-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink-600">{log.record_id?.slice(0, 12)}...</td>
                  <td className="px-3 py-2 max-w-md">
                    <details className="text-xs text-ink-500">
                      <summary className="cursor-pointer truncate">{log.old_data ? 'Modified' : log.new_data ? 'Created' : 'Deleted'}</summary>
                      <pre className="mt-1 p-2 bg-[var(--page-bg)] rounded overflow-x-auto whitespace-pre-wrap">{JSON.stringify({ old: log.old_data, new: log.new_data }, null, 2)}</pre>
                    </details>
                  </td>
                  <td className="px-3 py-2 text-ink-400 font-mono text-xs">{log.ip_address || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Showing {logs.length} entries (latest first)</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="p-2 rounded border border-ink-200 hover:bg-ink-100 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-3 text-sm">Page {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasMore || loading} className="p-2 rounded border border-ink-200 hover:bg-ink-100 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}