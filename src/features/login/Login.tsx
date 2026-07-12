import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/use-auth';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (_err) {
      setError('Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--page-bg)] text-ink-900">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 border border-ink-200 rounded-xl bg-white/60 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">PTP-102 Regulatory Platform</h1>
        <p className="text-sm text-ink-500">Institutional login required.</p>
        {error ? <div className="text-sm text-red-400">{error}</div> : null}
        <label className="block text-sm">
          <span className="text-ink-600">Email</span>
          <input
            className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-600">Password</span>
          <input
            className="mt-1 w-full rounded border border-ink-200 bg-[var(--page-bg)] px-2 py-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-ink-100 py-2 text-ink-900 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-xs text-ink-400">Demo accounts are provisioned via Supabase Auth.</p>
      </form>
    </div>
  );
}
