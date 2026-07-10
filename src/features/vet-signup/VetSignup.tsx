import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createVeterinarianProfile } from '../../lib/api';

export default function VetSignup() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    full_name: '',
    license_number: '',
    license_state: '',
    license_expiry_date: '',
    phone: '',
    address: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.full_name || !form.license_number) {
      setError('Email, full name, and license number are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createVeterinarianProfile({
        email: form.email,
        full_name: form.full_name,
        license_number: form.license_number,
        license_state: form.license_state || undefined,
        license_expiry_date: form.license_expiry_date || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      setSuccess('Application submitted. An admin will review your registration. If approved, you will receive an email with next steps to set your password.');
      setForm({ email: '', full_name: '', license_number: '', license_state: '', license_expiry_date: '', phone: '', address: '' });
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mx-auto mb-6 flex max-w-md items-center justify-center gap-3">
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

        <div className="mx-auto max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-sm font-semibold">Veterinarian Sign-Up</div>
              <div className="text-xs text-slate-400">Submit your details for admin approval</div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-300">B</div>
          </div>

          {error ? <div className="mb-3 text-sm text-red-400">{error}</div> : null}
          {success ? <div className="mb-3 text-sm text-emerald-300">{success}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="text-slate-300">Full name</span>
              <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
            </label>
            <label className="block text-sm">
              <span className="text-slate-300">Email</span>
              <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </label>
            <label className="block text-sm">
              <span className="text-slate-300">License number</span>
              <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={form.license_number} onChange={(e) => update('license_number', e.target.value)} required />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-slate-300">License state</span>
                <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={form.license_state} onChange={(e) => update('license_state', e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="text-slate-300">Expiry date</span>
                <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" type="date" value={form.license_expiry_date} onChange={(e) => update('license_expiry_date', e.target.value)} />
              </label>
            </div>
            <label className="block text-sm">
              <span className="text-slate-300">Phone</span>
              <input className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-300">Address</span>
              <textarea className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5" rows={2} value={form.address} onChange={(e) => update('address', e.target.value)} />
            </label>

            <button type="submit" disabled={submitting} className="w-full rounded bg-emerald-500 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
            <Link to="/login" className="block w-full text-center text-xs text-slate-400 hover:text-slate-200">
              ← Back to login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
