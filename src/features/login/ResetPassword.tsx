import { useState } from 'react';
import { updateUserPassword } from '../../lib/api';

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
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 border border-slate-800 rounded-md bg-slate-900/60 p-6">
        <h1 className="text-xl font-semibold">Set New Password</h1>
        {msg && <p className={'text-sm ' + (msg.includes('changed') ? 'text-green-400' : 'text-red-400')}>{msg}</p>}
        <label className="block">
          <span className="text-sm text-slate-400">New password (min 8 characters)</span>
          <input type="password" className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Confirm new password</span>
          <input type="password" className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </label>
        <button type="submit" disabled={busy} className="w-full py-2 bg-blue-700 hover:bg-blue-600 rounded text-sm font-medium disabled:opacity-50">{busy ? 'Saving...' : 'Set new password'}</button>
      </form>
    </div>
  );
}
