import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, FolderOpen, FileText, Globe2, PieChart, Presentation, LogOut, Shield, ChevronLeft, ChevronRight, Save, Send, Plus, X, Search, Download, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { supabase } from '../../lib/supabase';

type Tier = 'none' | 'evaluation' | 'diligence' | 'exclusive';
type Role = 'prospect' | 'investor' | 'regulatory' | 'auditor' | 'admin' | 'vet';
type Region = 'north_america' | 'eu' | 'uk' | 'uae' | 'apac' | 'global';
type TermSheetStatus = 'draft' | 'proposed' | 'negotiated' | 'signed' | 'executed';

interface UserProfile {
  id: string;
  email: string | null;
  company?: string;
  role?: Role;
  tier?: Tier;
  nda_signed_at?: string;
}

interface TermSheet {
  id: string;
  prospect_company: string;
  region: Region;
  upfront_fee: number;
  royalty_rate: number;
  exclusivity_months: number;
  milestones: { event: string; amount: number }[];
  status: TermSheetStatus;
  signed_name?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentItem {
  id: string;
  category: string;
  title: string;
  tier: Tier;
  filename: string;
  version: string;
}

interface RegionItem {
  region: Region;
  label: string;
  status: 'available' | 'under_evaluation' | 'under_negotiation' | 'licensed';
  base_fee: number;
}

const STORAGE_KEY = 'byrock_dealroom_profile';
const TERMS_KEY = 'byrock_dealroom_terms';

const REGIONS: RegionItem[] = [
  { region: 'north_america', label: 'North America', status: 'available', base_fee: 500000 },
  { region: 'eu', label: 'European Union', status: 'under_negotiation', base_fee: 450000 },
  { region: 'uk', label: 'United Kingdom', status: 'available', base_fee: 250000 },
  { region: 'uae', label: 'UAE / MENA', status: 'available', base_fee: 150000 },
  { region: 'apac', label: 'Asia Pacific', status: 'available', base_fee: 300000 },
  { region: 'global', label: 'Global Bundle', status: 'available', base_fee: 1500000 },
];

const DOCUMENTS: DocumentItem[] = [
  { id: 'd1', category: 'Company', title: 'Incorporation Documents', tier: 'evaluation', filename: '2_Incorporation_Documents.md', version: 'v1.0' },
  { id: 'd2', category: 'Company', title: 'Trademark & IP Filings', tier: 'evaluation', filename: '9_Trademark_IP_Documents.md', version: 'v1.0' },
  { id: 'd3', category: 'Investor', title: 'Pitch Deck', tier: 'evaluation', filename: '16_Pitch_Deck.md', version: 'v1.0' },
  { id: 'd4', category: 'IP', title: 'IP Assignment Agreement', tier: 'diligence', filename: '8_IP_Assignment_Agreement.md', version: 'v1.0' },
  { id: 'd5', category: 'CMC', title: 'CMC Dossier', tier: 'diligence', filename: 'CMC.md', version: 'v1.0' },
  { id: 'd6', category: 'CMC', title: 'CMC Development Plan', tier: 'diligence', filename: 'CMC_Development_Plan.md', version: 'v1.0' },
  { id: 'd7', category: 'Financial', title: 'Cap Table', tier: 'diligence', filename: '5_Cap_Table.md', version: 'v1.0' },
  { id: 'd8', category: 'Financial', title: 'Financial Model', tier: 'diligence', version: 'v1.0', filename: '17_Financial_Model.md' },
  { id: 'd9', category: 'Legal', title: 'Term Sheet Template', tier: 'diligence', filename: '18_Term_Sheet.md', version: 'v2.0' },
  { id: 'd10', category: 'Legal', title: 'Term Sheet Submissions', tier: 'exclusive', filename: 'termsheets', version: 'live' },
  { id: 'd11', category: 'CMC', title: 'Manufacturing Site Dossiers', tier: 'exclusive', filename: 'sitefiles', version: 'v1.0' },
];

const TRIAL_EVENTS = [
  { id: 'e1', horseId: 'LAM-00007-SM', eventType: 'treatment', data: '535 mg IV administered', hour: 0, timestamp: '2025-10-05T08:00:00Z' },
  { id: 'e2', horseId: 'LAM-00007-SM', eventType: 'assessment', data: 'Grade 3 laminitis baseline confirmed', hour: 0, timestamp: '2025-10-05T08:30:00Z' },
  { id: 'e3', horseId: 'LAM-00007-SM', eventType: 'assessment', data: 'No complications observed', hour: 8, timestamp: '2025-10-05T16:00:00Z' },
  { id: 'e4', horseId: 'LAM-00007-SM', eventType: 'assessment', data: 'Reduction in pain response', hour: 24, timestamp: '2025-10-06T08:00:00Z' },
  { id: 'e5', horseId: 'LAM-00007-SM', eventType: 'assessment', data: 'Improved mobility', hour: 32, timestamp: '2025-10-06T16:00:00Z' },
  { id: 'e6', horseId: 'LAM-00007-SM', eventType: 'assessment', data: 'Excellent clinical response', hour: 56, timestamp: '2025-10-07T16:00:00Z' },
  { id: 'e7', horseId: 'LAM-00007-SM', eventType: 'assessment', data: 'Treatment complete — favourable outcome', hour: 72, timestamp: '2025-10-08T08:00:00Z' },
  { id: 'e8', horseId: 'LAM-00008-AM', eventType: 'treatment', data: '420 mg IV administered', hour: 0, timestamp: '2025-11-12T09:00:00Z' },
  { id: 'e9', horseId: 'LAM-00008-AM', eventType: 'assessment', data: 'Grade 2 laminitis; responsive within 24h', hour: 24, timestamp: '2025-11-13T09:00:00Z' },
];

const chartData = [
  { hour: 0, grade: 3, label: 'Baseline' },
  { hour: 8, grade: 3, label: 'No complications' },
  { hour: 24, grade: 2, label: 'Pain reduction' },
  { hour: 32, grade: 2, label: 'Improved mobility' },
  { hour: 48, grade: 1, label: 'Positive response' },
  { hour: 56, grade: 1, label: 'Excellent response' },
  { hour: 72, grade: 0, label: 'Favourable' },
];

const capTableData = [
  { name: 'Cormac Jones', value: 45, shares: 450000 },
  { name: 'Daniel Shanahan-Prendergast', value: 30, shares: 300000 },
  { name: 'ESOP Pool', value: 10, shares: 100000 },
  { name: 'Seed Investors', value: 10, shares: 100000 },
  { name: 'Advisor Options', value: 5, shares: 50000 },
];

const PITCH_SLIDES = [
  {
    title: 'PTP-102: Novel Equine Laminitis Therapy',
    bullets: [
      'Methylated tirilazad (U-74389G) — 21-aminosteroid with dual mechanism',
      'Targets laminitis via MMP inhibition + inflammation control',
      'International patent portfolio covering equine use',
    ],
  },
  {
    title: 'Clinical Evidence',
    bullets: [
      'LAM-00007 Silver Moon trial: Grade 3 laminitis → favourable outcome in 72h',
      'No adverse reactions reported',
      'RXE/TAS studies planned to support FDA CVM conditional approval',
    ],
  },
  {
    title: 'Market Opportunity',
    bullets: [
      'Global equine therapeutics market growing 6-8% annually',
      'Laminitis is a top cause of equine morbidity and euthanasia',
      'First-in-class positioning with 5% net sales royalty target',
    ],
  },
  {
    title: 'Licensing Model',
    bullets: [
      'Tiered deal-room access for prospective partners',
      'Global region licences with milestone + royalty structure',
      'Target conditional approval: 3Q28',
    ],
  },
];

const orderTier = (tier: Tier) => ({ none: 0, evaluation: 1, diligence: 2, exclusive: 3 } as const)[tier];
const canAccessTier = (userTier: Tier, requiredTier: Tier) => orderTier(userTier) >= orderTier(requiredTier);

const tierBadge = (tier: string) => {
  switch (tier) {
    case 'evaluation':
      return 'bg-emerald-900 text-emerald-300';
    case 'diligence':
      return 'bg-sky-900 text-sky-300';
    case 'exclusive':
      return 'bg-amber-900 text-amber-300';
    default:
      return 'bg-slate-800 text-slate-300';
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-slate-600';
    case 'proposed':
      return 'bg-amber-600';
    case 'negotiated':
      return 'bg-sky-600';
    case 'signed':
      return 'bg-emerald-600';
    case 'executed':
      return 'bg-emerald-500';
    case 'available':
      return 'bg-emerald-700';
    case 'under_evaluation':
      return 'bg-amber-700';
    case 'under_negotiation':
      return 'bg-sky-700';
    case 'licensed':
      return 'bg-slate-500';
    default:
      return 'bg-slate-600';
  }
};

const regionLabel = (r: Region) => REGIONS.find((x) => x.region === r)?.label || r;

export default function DealRoom() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const authRole = (user.role as UserProfile['role']) || 'admin';
    return (
      raw
        ? JSON.parse(raw)
        : {
            id: user.id,
            email: user.email || '',
            company: '',
            role: authRole,
            tier: 'diligence',
          }
    );
  });

  const [page, setPage] = useState<
    'dashboard' | 'pitch' | 'trials' | 'data-room' | 'term-sheet' | 'marketplace' | 'cap-table'
  >('dashboard');

  const [terms, setTerms] = useState<TermSheet[]>(() => {
    const raw = localStorage.getItem(TERMS_KEY);
    if (raw) return JSON.parse(raw);
    return [
      {
        id: 'ts-demo-1',
        prospect_company: profile.company || 'Prospect',
        region: 'eu',
        upfront_fee: 250000,
        royalty_rate: 5,
        exclusivity_months: 6,
        milestones: [
          { event: 'FDA conditional approval (3Q28)', amount: 500000 },
          { event: 'First commercial sale', amount: 250000 },
          { event: '$10M cumulative net sales', amount: 1000000 },
        ],
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    setProfile((prev) => ({ ...prev, id: user.id, email: user.email || prev.email }));
  }, [user.id, user.email]);

  const saveTerms = (next: TermSheet[]) => {
    setTerms(next);
    localStorage.setItem(TERMS_KEY, JSON.stringify(next));
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const activeTerm = useMemo(() => terms[0] || null, [terms]);

  const updateTerm = (id: string, patch: Partial<TermSheet>) => {
    const next = terms.map((t) => (t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t));
    saveTerms(next);
  };

  const updateTermMilestone = (id: string, idx: number, patch: Partial<{ event: string; amount: number }>) => {
    const next = terms.map((t) => {
      if (t.id !== id) return t;
      const milestones = t.milestones.map((m, i) => (i === idx ? { ...m, ...patch } : m));
      return { ...t, milestones, updated_at: new Date().toISOString() };
    });
    saveTerms(next);
  };

  const addMilestone = (id: string) => {
    const next = terms.map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        milestones: [...t.milestones, { event: 'New milestone', amount: 0 }],
        updated_at: new Date().toISOString(),
      };
    });
    saveTerms(next);
  };

  const removeMilestone = (id: string, idx: number) => {
    const next = terms.map((t) => {
      if (t.id !== id) return t;
      const milestones = t.milestones.filter((_, i) => i !== idx);
      return { ...t, milestones, updated_at: new Date().toISOString() };
    });
    saveTerms(next);
  };

  const createTermForRegion = (region: Region) => {
    const regionData = REGIONS.find((x) => x.region === region)!;
    const newTerm: TermSheet = {
      id: crypto.randomUUID(),
      prospect_company: profile.company || 'Prospect',
      region,
      upfront_fee: regionData.base_fee,
      royalty_rate: 5,
      exclusivity_months: 6,
      milestones: [
        { event: 'Regulatory approval', amount: 500000 },
        { event: 'First commercial sale', amount: 250000 },
        { event: '$10M net sales', amount: 1000000 },
      ],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveTerms([newTerm, ...terms]);
    setPage('term-sheet');
  };

  const submitTermForLegal = () => {
    if (!activeTerm) return;
    if (!profile.signed_name) {
      alert('Please sign the term sheet before submitting.');
      return;
    }
    updateTerm(activeTerm.id, { status: 'proposed', signed_name: profile.signed_name, signed_at: new Date().toISOString() });
    alert('Term sheet submitted for legal review. Our legal team will be in touch.');
  };

  const signTermSheet = () => {
    const name = prompt('Type your full name as digital signature:');
    if (!name) return;
    updateProfile({ signed_name: name });
  };

  const lockedTrial = !canAccessTier(profile.tier || 'none', 'diligence');

  // NDA gate: block everything until signed in profile
  const ndaLocked = !profile.nda_signed_at;

  const signNda = () => {
    const confirmed = confirm('By clicking OK you confirm you are an authorised representative and agree to the NDA terms for ' + (profile.company || 'your company') + '.');
    if (!confirmed) return;
    updateProfile({ nda_signed_at: new Date().toISOString() });
  };

  if (ndaLocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-2">Mutual Non-Disclosure Agreement</h1>
          <p className="text-sm text-slate-400 mb-4">You must execute the NDA before accessing deal room materials.</p>
          <div className="border border-slate-800 rounded-md bg-slate-900/60 p-4 text-sm text-slate-300 space-y-2 mb-6">
            <p><strong>BYROCK CLINICAL LTD NDA</strong></p>
            <p>This Mutual Non-Disclosure Agreement is entered into between Byrock Clinical Ltd and {profile.company || 'the recipient'} to enable evaluation of a potential licence, investment or collaboration relating to PTP-102.</p>
            <p>1. Confidential Information. All non-public technical, financial, clinical, regulatory and commercial information is confidential.</p>
            <p>2. Obligations. Recipient shall hold Confidential Information in strict confidence and not disclose to third parties except advisors with a need to know.</p>
            <p>3. Term. Two (2) years from execution.</p>
            <p>4. Governing Law. Republic of Ireland.</p>
          </div>
          <button
            onClick={signNda}
            className="rounded bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500"
          >
            I Agree — Sign NDA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-sky-400" />
            <span className="font-bold text-lg">Byrock</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">PTP-102 Deal Room</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { key: 'pitch', label: 'Pitch Deck', icon: Presentation },
            { key: 'data-room', label: 'Data Room', icon: FolderOpen },
            { key: 'term-sheet', label: 'Term Sheet', icon: FileText },
            { key: 'marketplace', label: 'Regions', icon: Globe2 },
            { key: 'cap-table', label: 'Cap Table', icon: PieChart },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  page === item.key ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <p className="text-sm font-medium truncate">{profile.email || user.email}</p>
          <p className="text-xs text-slate-400 truncate">{profile.company}</p>
          <span className={`inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded text-white ${tierBadge(profile.tier || 'evaluation')}`}>
            {profile.tier || 'evaluation'}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(TERMS_KEY);
            }}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" /> Exit Deal Room
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {page === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {profile.company || 'Partner'}</h1>
              <p className="text-slate-400">
                Current access tier: <span className="text-sky-400 font-semibold">{profile.tier || 'evaluation'}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <FolderOpen className="w-5 h-5 text-sky-400" />
                  <h3 className="font-semibold">Data Room</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">Access pitch deck, cap table, CMC dossier and term sheet templates.</p>
                <button onClick={() => setPage('data-room')} className="text-sm text-sky-400 hover:underline">Open Data Room →</button>
              </div>
              <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  <h3 className="font-semibold">Term Sheets</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">Draft and submit regional licence proposals.</p>
                <button onClick={() => setPage('term-sheet')} className="text-sm text-sky-400 hover:underline">Open Term Sheet →</button>
              </div>
              <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Globe2 className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold">Region Marketplace</h3>
                </div>
                <p className="text-sm text-slate-400 mb-3">Browse global territories available for PTP-102 licensing.</p>
                <button onClick={() => setPage('marketplace')} className="text-sm text-amber-400 hover:underline">View Regions →</button>
              </div>
            </div>
            <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
              <h3 className="font-semibold mb-3">Key Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-1"><span>Target Conditional Approval</span><span className="font-medium">3Q28</span></div>
                <div className="flex justify-between border-b border-slate-800 pb-1"><span>Non-CMC Base Cost</span><span className="font-medium">~$519k</span></div>
                <div className="flex justify-between border-b border-slate-800 pb-1"><span>Indicative Royalty</span><span className="font-medium">5%</span></div>
                <div className="flex justify-between"><span>Year 1 Revenue Forecast</span><span className="font-medium">~$119.7M</span></div>
              </div>
            </div>
          </div>
        )}

        {page === 'pitch' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Pitch Deck</h1>
            <PitchView />
          </div>
        )}

        {page === 'trials' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">Live Trials</h1>
            {lockedTrial ? (
              <div className="border border-slate-800 rounded-md bg-slate-900/60 p-8 text-center">
                <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold">Due Diligence Tier Required</h2>
                <p className="text-slate-400 mt-2">Live trial feeds are available from the Due Diligence tier onwards.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
                  <h3 className="font-semibold mb-4">LAM-00007 Silver Moon — Laminitis Grade Over Time</h3>
                  <div className="space-y-2">
                    {chartData.map((point) => (
                      <div key={point.hour} className="flex items-center gap-3 text-sm">
                        <span className="w-16 text-slate-400">{point.hour}h</span>
                        <div className="flex-1 h-2 rounded bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${((4 - point.grade) / 4) * 100}%` }}
                          />
                        </div>
                        <span className="w-32 text-slate-300">{point.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
                  <h3 className="font-semibold mb-4">Event Stream</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="py-2">Horse ID</th>
                          <th className="py-2">Hour</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Event</th>
                          <th className="py-2">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {TRIAL_EVENTS.map((e) => (
                          <tr key={e.id}>
                            <td className="py-2 font-mono">{e.horseId}</td>
                            <td className="py-2">{e.hour}</td>
                            <td className="py-2 capitalize">{e.eventType.replace('_', ' ')}</td>
                            <td className="py-2">{e.data}</td>
                            <td className="py-2 text-slate-400">{new Date(e.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'data-room' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Data Room</h1>
            <DataRoomView profile={profile} />
          </div>
        )}

        {page === 'term-sheet' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Term Sheet Builder</h1>
            <TermSheetView profile={profile} term={activeTerm} terms={terms} onChange={updateTerm} onChangeMilestone={updateTermMilestone} onAddMilestone={() => addMilestone(activeTerm!.id)} onRemoveMilestone={(idx) => removeMilestone(activeTerm!.id, idx)} onSubmit={submitTermForLegal} onSign={signTermSheet} />
          </div>
        )}

        {page === 'marketplace' && <div className="space-y-6"><h1 className="text-2xl font-bold">Region Marketplace</h1><MarketplaceView onCreate={createTermForRegion} /></div>}
        {page === 'cap-table' && <div className="space-y-6"><h1 className="text-2xl font-bold">Cap Table</h1><CapTableView /></div>}
      </main>
    </div>
  );
}

function PitchView() {
  const [idx, setIdx] = useState(0);
  const slide = PITCH_SLIDES[idx];
  return (
    <div className="space-y-4">
      <div className="border border-slate-800 rounded-md bg-slate-900/60 p-8 min-h-[360px] flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
          <ul className="space-y-4">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-lg text-slate-200">
                <span className="w-2 h-2 mt-2.5 rounded-full bg-sky-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="flex items-center gap-1 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /> Previous</button>
          <span className="text-sm text-slate-400">{idx + 1} / {PITCH_SLIDES.length}</span>
          <button onClick={() => setIdx((i) => Math.min(PITCH_SLIDES.length - 1, i + 1))} disabled={idx === PITCH_SLIDES.length - 1} className="flex items-center gap-1 px-4 py-2 rounded bg-sky-700 hover:bg-sky-600 disabled:opacity-40">Next <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

function DataRoomView({ profile }: { profile: UserProfile }) {
  const [filter, setFilter] = useState('');
  const docs = DOCUMENTS.filter((d) => d.title.toLowerCase().includes(filter.toLowerCase()) || d.category.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border border-slate-800 rounded-md bg-slate-900/60 px-3 py-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent flex-1 text-sm focus:outline-none text-slate-100 placeholder:text-slate-500"
        />
      </div>
      <div className="grid gap-3">
        {docs.map((doc) => {
          const access = canAccessTier((profile.tier as Tier) || 'none', doc.tier);
          return (
            <div key={doc.id} className={`flex items-center justify-between p-4 rounded-md border ${access ? 'border-slate-800 bg-slate-900/60' : 'border-slate-800/50 bg-slate-900/30'}`}>
              <div className="flex items-start gap-3">
                <FileText className={`w-5 h-5 mt-0.5 ${access ? 'text-sky-400' : 'text-slate-600'}`} />
                <div>
                  <h3 className={`font-medium ${access ? '' : 'text-slate-500'}`}>{doc.title}</h3>
                  <p className="text-xs text-slate-400">{doc.category} • {doc.filename} • {doc.version}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded text-white ${statusBadge(doc.tier)}`}>{doc.tier}</span>
                    {!access && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400"><Lock className="w-3 h-3" /> Upgrade to {doc.tier}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                disabled={!access}
                onClick={() => alert(`Demo download: ${doc.title}\nWatermark: ${profile.company} | ${profile.email} | ${new Date().toISOString()}`)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition ${access ? 'bg-sky-700 hover:bg-sky-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TermSheetView({
  profile,
  term,
  terms,
  onChange,
  onChangeMilestone,
  onAddMilestone,
  onRemoveMilestone,
  onSubmit,
  onSign,
}: {
  profile: UserProfile;
  term: TermSheet | undefined;
  terms: TermSheet[];
  onChange: (id: string, patch: Partial<TermSheet>) => void;
  onChangeMilestone: (id: string, idx: number, patch: Partial<{ event: string; amount: number }>) => void;
  onAddMilestone: () => void;
  onRemoveMilestone: (idx: number) => void;
  onSubmit: () => void;
  onSign: () => void;
}) {
  const [activeId, setActiveId] = useState(term?.id || '');
  const active = terms.find((t) => t.id === activeId) || term;

  if (!active) return <p className="text-slate-400">No term sheets yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Term Sheet Builder</h2>
          <p className="text-slate-400 text-sm">Draft, sign and submit PTP-102 regional licences for legal review.</p>
        </div>
        <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full text-white ${statusBadge(active.status)}`}>{active.status}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-slate-800 rounded-md bg-slate-900/60 p-4 space-y-2">
          <h3 className="font-semibold text-sm text-slate-300">Active Term Sheets</h3>
          {terms.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition ${s.id === activeId ? 'bg-sky-900 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              {regionLabel(s.region)} — {s.status}
            </button>
          ))}
        </div>
        <div className="lg:col-span-2 border border-slate-800 rounded-md bg-slate-900/60 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Licensee</label>
              <input
                type="text"
                value={active.prospect_company}
                onChange={(e) => onChange(active.id, { prospect_company: e.target.value })}
                className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Region</label>
              <select
                value={active.region}
                onChange={(e) => onChange(active.id, { region: e.target.value as Region })}
                className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm"
              >
                {REGIONS.map((r) => (
                  <option key={r.region} value={r.region}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Upfront Fee (USD)</label>
              <input type="number" value={active.upfront_fee} onChange={(e) => onChange(active.id, { upfront_fee: Number(e.target.value) })} className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Royalty Rate (%)</label>
              <input type="number" step={0.1} value={active.royalty_rate} onChange={(e) => onChange(active.id, { royalty_rate: Number(e.target.value) })} className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Exclusivity (months)</label>
              <input type="number" value={active.exclusivity_months} onChange={(e) => onChange(active.id, { exclusivity_months: Number(e.target.value) })} className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">Milestone Payments</label>
              <button onClick={onAddMilestone} className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="space-y-2">
              {active.milestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.event}
                    onChange={(e) => onChangeMilestone(idx, { event: e.target.value })}
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm"
                    placeholder="Milestone event"
                  />
                  <input
                    type="number"
                    value={m.amount}
                    onChange={(e) => onChangeMilestone(idx, { amount: Number(e.target.value) })}
                    className="w-32 rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm"
                    placeholder="USD"
                  />
                  <button onClick={() => onRemoveMilestone(idx)} className="p-2 text-slate-400 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                onChange(active.id, {});
                alert('Saved locally.');
              }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={onSign}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm"
            >
              Digital Signature ({profile.signed_name ? `Signed as ${profile.signed_name}` : 'Unsigned'})
            </button>
            <button
              onClick={onSubmit}
              disabled={active.status !== 'draft'}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm ${active.status === 'draft' ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              <Send className="w-4 h-4" /> Submit for Legal Review
            </button>
          </div>
          <p className="text-xs text-slate-500">No payment is processed here. Terms are submitted to Byrock legal for review and execution.</p>
        </div>
      </div>
    </div>
  );
}

function MarketplaceView({ onCreate }: { onCreate: (r: Region) => void }) {
  const [selected, setSelected] = useState<Region | null>(null);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REGIONS.map((r) => (
          <button
            key={r.region}
            onClick={() => setSelected(r.region)}
            className={`text-left p-5 rounded-md border transition ${selected === r.region ? 'border-amber-400 bg-slate-800' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{r.label}</h3>
              {r.status === 'licensed' ? <Lock className="w-4 h-4 text-slate-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-400 mb-3">Base licence fee indicative</p>
            <p className="text-xl font-bold text-amber-400">${r.base_fee.toLocaleString()}</p>
            <span className={`mt-3 inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded text-white ${statusBadge(r.status)}`}>{r.status.replace('_', ' ')}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
          <h3 className="font-semibold mb-2">Selected: {regionLabel(selected)}</h3>
          <p className="text-sm text-slate-400 mb-4">This will create a new term sheet draft with the region’s indicative upfront fee and default milestones.</p>
          <button onClick={() => onCreate(selected)} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded text-sm">Generate Term Sheet Draft</button>
        </div>
      )}
    </div>
  );
}

function CapTableView() {
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
        <h3 className="font-semibold mb-4">Ownership</h3>
        <div className="space-y-3">
          {capTableData.map((row, idx) => (
            <div key={row.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.name}</span>
                  <span className="font-semibold">{row.value}%</span>
                </div>
                <div className="h-2 rounded bg-slate-800 overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${row.value}%`, backgroundColor: COLORS[idx] }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-slate-800 rounded-md bg-slate-900/60 p-5">
        <h3 className="font-semibold mb-4">Shareholders</h3>
        <div className="space-y-2">
          {capTableData.map((row, idx) => (
            <div key={row.name} className="flex items-center justify-between p-3 rounded border border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-sm font-medium">{row.name}</span>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{row.value}%</p>
                <p className="text-slate-400 text-xs">{row.shares.toLocaleString()} shares</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
