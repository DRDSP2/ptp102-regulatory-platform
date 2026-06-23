import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

export default function TrialPortal() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'select' | 'vet-login' | 'admin-login'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // Auth context resolves role; no need to pass role here.
      navigate('/dashboard', { replace: true });
    } catch (_err) {
      setError('Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openVet = () => setMode('vet-login');
  const openAdmin = () => setMode('admin-login');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <div className="relative border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded bg-emerald-500/20 text-emerald-300">
            <span className="text-sm font-bold">B</span>
          </div>
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-800 text-[10px]">⚗️</span>
            Clinical Trial Management Platform
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">PTP-102 Laminitis Trial</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            A breakthrough therapeutic solution for equine laminitis. Supporting veterinarians worldwide in advancing equine
            healthcare.
          </p>

          <div className="mx-auto mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-left">
              <div className="mb-2 h-8 w-8 rounded-full bg-slate-800 text-emerald-300">❤️</div>
              <div className="text-sm font-semibold text-white">72-Hour Protocol</div>
              <div className="text-xs text-slate-400">Two-dose administration with close monitoring</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-left">
              <div className="mb-2 h-8 w-8 rounded-full bg-slate-800 text-emerald-300">🛡️</div>
              <div className="text-sm font-semibold text-white">Patents Pending</div>
              <div className="text-xs text-slate-400">Europe, US & Australia coverage</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-left">
              <div className="mb-2 h-8 w-8 rounded-full bg-slate-800 text-emerald-300">⚗️</div>
              <div className="text-sm font-semibold text-white">5 mg/mL IV</div>
              <div className="text-xs text-slate-400">500mL slow jugular infusion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selection */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto mb-8 flex max-w-md items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-500 text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-6a1 1 0 00-1-1H7a1 1 0 00-1 1v6" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-emerald-300">BYROCK TECHNOLOGIES LIMITED</div>
            <div className="text-xs text-slate-500">Redefining Equine Health</div>
          </div>
        </div>

        <div className="mx-auto max-w-md rounded-lg border border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">PTP-102 Trial Portal</div>
              <div className="text-xs text-slate-400">Select access type to continue</div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-300">B</div>
          </div>
          <div className="grid gap-3 p-4">
            <button
              type="button"
              onClick={openVet}
              className="flex items-center justify-center gap-2 rounded bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/20 text-xs">👤</span>
              Veterinarian Access
            </button>
            <button
              type="button"
              onClick={openAdmin}
              className="flex items-center justify-center gap-2 rounded border border-slate-600 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-900/10 text-xs">🔒</span>
              Admin Access
            </button>
          </div>
        </div>

        {mode === 'vet-login' || mode === 'admin-login' ? (
          <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm font-semibold text-white">{mode === 'vet-login' ? 'Veterinarian Login' : 'Admin Login'}</div>
            <label className="block text-sm">
              <span className="text-slate-300">Email</span>
              <input
                className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-300">Password</span>
              <input
                className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </label>
            {error ? <div className="text-sm text-red-400">{error}</div> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-slate-100 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => setMode('select')}
              className="w-full text-xs text-slate-400 hover:text-slate-200"
            >
              ← Back
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
