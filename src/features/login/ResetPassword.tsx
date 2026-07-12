import { useState } from 'react';
import { updateUserPassword } from '../../lib/api';
import Spinner from '../../components/ui/spinner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (password.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setMsg('Passwords do not match.'); return; }
    setBusy(true);
    try {
      await updateUserPassword(password);
      setMsg('Password changed. You can now sign in.');
      setPassword('');
      setConfirm('');
    } catch (err: any) {
      setMsg(err.message ?? 'Reset failed. The link may have expired — request a new one from Settings.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--page-bg)] text-[var(--text-strong)] px-4">
      <form onSubmit={submit} className="w-full max-w-sm panel p-6 space-y-4 animate-slide-up">
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">Set New Password</h1>
        <p className="text-sm text-ink-500">Choose a strong password for your account.</p>

        {msg && (
          <div className={`text-sm rounded-xl border px-3 py-2 ${msg.includes('changed') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {msg}
          </div>
        )}

        <label className="block">
          <span className="block text-xs font-medium text-ink-700">New password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(45,138,247,0.12)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-ink-700">Confirm new password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(45,138,247,0.12)]"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 disabled:opacity-60 motion-safe:animate-fade-in"
        >
          {busy && <Spinner size={16} />}
          {busy ? 'Saving...' : 'Set new password'}
        </button>
        <p className="text-xs text-ink-400">
          Remember your password? <Link to="/login" className="text-brand-600 hover:text-brand-700">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
