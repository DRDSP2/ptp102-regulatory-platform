import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import Button from '../../components/ui/button';

type Mode = 'select' | 'vet-login' | 'admin-login' | 'company-login';

export default function TrialPortal() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (mode === 'admin-login') return 'Admin Login';
    if (mode === 'company-login') return 'Company / Licensing Partner Login';
    if (mode === 'vet-login') return 'Veterinarian Login';
    return 'PTP-102 Trial Portal';
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (_err) {
      setError('Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-strong)]">
      <div className="border-b border-ink-200 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">B</div>
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-600 shadow-soft">
            Clinical Trial Management Platform
          </div>
          <h1 className="text-center text-4xl font-semibold tracking-tight text-ink-900">PTP-102 Laminitis Trial</h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-500">
            A breakthrough therapeutic solution for equine laminitis. Supporting veterinarians worldwide in advancing equine healthcare.
          </p>

          <div className="mx-auto mt-8 grid gap-4 sm:grid-cols-3">
            <div className="panel p-5 text-left">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Protocol</div>
              <div className="text-sm font-semibold text-ink-900">72-Hour Protocol</div>
              <div className="mt-1 text-xs text-ink-500">Two-dose administration with close monitoring</div>
            </div>
            <div className="panel p-5 text-left">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">IP</div>
              <div className="text-sm font-semibold text-ink-900">Patents Pending</div>
              <div className="mt-1 text-xs text-ink-500">Europe, US & Australia coverage</div>
            </div>
            <div className="panel p-5 text-left">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Dose</div>
              <div className="text-sm font-semibold text-ink-900">5 mg/mL IV</div>
              <div className="mt-1 text-xs text-ink-500">500mL slow jugular infusion</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="mx-auto mb-8 flex max-w-md items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">B</div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-ink-900">BYROCK TECHNOLOGIES LIMITED</div>
            <div className="text-xs text-ink-500">Redefining Equine Health</div>
          </div>
        </div>

        {mode === 'select' && (
          <div className="mx-auto max-w-md panel overflow-hidden animate-slide-up">
            <div className="border-b border-ink-200 bg-white/60 px-5 py-4">
              <div className="text-sm font-semibold text-ink-900">PTP-102 Trial Portal</div>
              <div className="text-xs text-ink-500">Select access type to continue</div>
            </div>
            <div className="grid gap-2.5 p-4">
              <Button variant="outline" className="w-full justify-center" onClick={() => setMode('company-login')}>
                Company / Licensing Partner
              </Button>
              <Button className="w-full justify-center bg-brand-600 hover:bg-brand-700" onClick={() => setMode('vet-login')}>
                Veterinarian Access
              </Button>
              <Button variant="secondary" className="w-full justify-center" onClick={() => setMode('admin-login')}>
                Admin Access
              </Button>
            </div>
            <div className="border-t border-ink-200 bg-white/50 px-5 py-3">
              <Link to="/signup" className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-800">
                <span>Apply for veterinarian access</span>
              </Link>
            </div>
          </div>
        )}

        {mode !== 'select' && (
          <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md panel p-6 animate-slide-up">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
              <p className="text-xs text-ink-500">Enter your credentials to continue.</p>
            </div>
            {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
            <div className="space-y-3">
              <label className="block">
                <span className="block text-xs font-medium text-ink-700">Email</span>
                <input type="email" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-ink-700">Password</span>
                <input type="password" className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" minLength={8} />
              </label>
              <Button type="submit" disabled={loading} className="w-full justify-center">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setMode('select')} className="text-xs text-ink-500 hover:text-ink-800">← Back</button>
                <button type="button" onClick={() => navigate('/reset-password')} className="text-xs text-brand-700 hover:text-brand-800">Forgot password?</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
