import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { getAllPatients, getAEsForPatient, submitFdaReport } from '../../lib/api';
import { FileText, Download, Send, AlertCircle, CheckCircle, Loader2, Calendar } from 'lucide-react';

export default function Reports() {
  const { role } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientAEs, setPatientAEs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'initial' | 'followup' | 'periodic'>('initial');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const loadPatients = async () => {
    try {
      const list = await getAllPatients();
      setPatients(list);
    } catch (err) {
      console.error('Load patients error:', err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatientAEs = async (patientId: string) => {
    try {
      const aes = await getAEsForPatient(patientId);
      setPatientAEs(aes);
      setSelectedPatient(patients.find(p => p.id === patientId) || null);
    } catch (err) {
      console.error('Load AEs error:', err);
    }
  };

  const handleExport = async (aeId: string, type: 'initial' | 'followup' | 'periodic') => {
    try {
      setExporting(aeId);
      const result = await submitFdaReport(aeId, type);
      alert(`FDA E2B(R3) report submitted successfully!\nReport ID: ${result.report_id}\nStatus: ${result.status}`);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Failed to submit: ${err.message || 'Unknown error'}`);
    } finally {
      setExporting(null);
    }
  };

  const handleBulkExport = async () => {
    // Export all AEs in date range as E2B batch
    alert('Bulk E2B export would generate a batch XML file for FDA Gateway submission.');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">FDA E2B(R3) Reports</h2>
      <p className="text-sm text-slate-400">Generate FDA-compliant adverse event reports in E2B(R3) XML format for regulatory submission.</p>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Patient Selector */}
        <div className="lg:col-span-1 border border-slate-800 rounded-md overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-medium text-sm">Select Patient</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <ul className="divide-y divide-slate-800">
              {patients.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => loadPatientAEs(p.id)}
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

        {/* AE List + Export */}
        <div className="lg:col-span-2 border border-slate-800 rounded-md overflow-hidden">
          {selectedPatient ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedPatient.horse_name} — #{selectedPatient.patient_number}</h3>
                  <p className="text-sm text-slate-400">{patientAEs.length} adverse event(s) recorded</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={reportType} onChange={e => setReportType(e.target.value as any)} className="rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm">
                    <option value="initial">Initial Report</option>
                    <option value="followup">Follow-up Report</option>
                    <option value="periodic">Periodic Report</option>
                  </select>
                  <button onClick={handleBulkExport} className="px-3 py-1.5 rounded border border-slate-800 text-sm hover:bg-slate-800">
                    <Download className="h-4 w-4 mr-1" />
                    Bulk Export
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
                <h4 className="font-medium mb-2">Report Types</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li><strong>Initial:</strong> First report of a newly identified AE (15-day for serious, 30-day for non-serious)</li>
                  <li><strong>Follow-up:</strong> Additional information on a previously reported AE</li>
                  <li><strong>Periodic:</strong> Aggregate safety summary (PSUR/PBRER format)</li>
                </ul>
              </div>

              {patientAEs.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p>No adverse events to report for this patient.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patientAEs.map(ae => (
                    <div key={ae.id} className="border border-slate-800 rounded p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{ae.ae_term}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              ae.severity === 'severe' || ae.severity === 'life_threatening' || ae.severity === 'fatal'
                                ? 'bg-red-900/30 text-red-300' :
                              ae.severity === 'moderate' ? 'bg-amber-900/30 text-amber-300' :
                              'bg-green-900/30 text-green-300'
                            }`}>
                              {ae.severity.replace('_', ' ')}
                            </span>
                            {ae.serious && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-red-900/30 text-red-300 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> SERIOUS — 15-day report required
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-4">
                            <span>Onset: {ae.onset_date ? new Date(ae.onset_date).toLocaleDateString() : '—'}</span>
                            <span>Relationship: {ae.relationship}</span>
                            <span>Outcome: {ae.outcome}</span>
                            {ae.report_status && <span className="text-green-300">FDA: {ae.report_status}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleExport(ae.id, reportType)}
                          disabled={exporting === ae.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
                        >
                          {exporting === ae.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          {exporting === ae.id ? 'Submitting...' : `Submit ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-slate-400">
              <FileText className="h-12 w-12 mb-3 text-slate-600" />
              <p>Select a patient to view adverse events and generate FDA reports.</p>
              <p className="text-xs">Reports are generated in E2B(R3) XML format per FDA specifications.</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Formats Info */}
      <div className="border border-slate-800 rounded-md p-4">
        <h3 className="font-medium mb-3">E2B(R3) Export Details</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
            <h4 className="font-medium text-slate-300 mb-2">Included Data Elements</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• Patient demographics (de-identified)</li>
              <li>• Drug details: PTP-102, batch, dose, route</li>
              <li>• AE term (MedDRA), severity, seriousness</li>
              <li>• Causality assessment (relationship)</li>
              <li>• Outcome, action taken, treatment change</li>
              <li>• Relevant lab results & clinical assessments</li>
              <li>• Concomitant medications</li>
              <li>• Reporter information (vet + site)</li>
            </ul>
          </div>
          <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
            <h4 className="font-medium text-slate-300 mb-2">Regulatory Timelines</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• <strong>Serious AE:</strong> 15 calendar days (initial)</li>
              <li>• <strong>Non-serious AE:</strong> 30 calendar days (initial)</li>
              <li>• <strong>Follow-up:</strong> As soon as new info available</li>
              <li>• <strong>Periodic (PSUR):</strong> Per FDA IND requirements</li>
            </ul>
          </div>
          <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
            <h4 className="font-medium text-slate-300 mb-2">Submission Channels</h4>
            <ul className="text-slate-400 space-y-1">
              <li>• FDA Safety Reporting Portal</li>
              <li>• FDA Gateway (AS2/ESG)</li>
              <li>• Email: CDERFrePort@fda.hhs.gov</li>
              <li>• Format: E2B(R3) XML + PDF narrative</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}