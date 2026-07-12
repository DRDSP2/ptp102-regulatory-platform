import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createVeterinarianProfile } from '../../lib/api';
import Button from '../../components/ui/button';

type FormState = {
  email: string;
  full_name: string;
  license_number: string;
  license_state: string;
  license_expiry_date: string;
  phone: string;
  address: string;
};

export default function VetSignup() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState<FormState>({
    email: '',
    full_name: '',
    license_number: '',
    license_state: '',
    license_expiry_date: '',
    phone: '',
    address: '',
  });

  const update = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

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
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-strong)]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mx-auto mb-6 flex max-w-md items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">B</div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-ink-900">BYROCK TECHNOLOGIES LIMITED</div>
            <div className="text-xs text-ink-500">Redefining Equine Health</div>
          </div>
        </div>

        <div className="mx-auto max-w-md panel overflow-hidden animate-slide-up">
          <div className="border-b border-ink-200 bg-white/60 px-5 py-4">
            <div className="text-sm font-semibold text-ink-900">Veterinarian Sign-Up</div>
            <div className="text-xs text-ink-500">Submit your details for admin approval</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {error && <div className="text-sm text-red-700">{error}</div>}
            {success && <div className="text-sm text-emerald-700">{success}</div>}

            <label className="block">
              <span className="block text-xs font-medium text-ink-700">Full name</span>
              <input className="mt-1" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-ink-700">Email</span>
              <input type="email" className="mt-1" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-ink-700">License number</span>
              <input className="mt-1" value={form.license_number} onChange={(e) => update('license_number', e.target.value)} required />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-ink-700">License state</span>
                <input className="mt-1" value={form.license_state} onChange={(e) => update('license_state', e.target.value)} />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-ink-700">Expiry date</span>
                <input type="date" className="mt-1" value={form.license_expiry_date} onChange={(e) => update('license_expiry_date', e.target.value)} />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-ink-700">Phone</span>
              <input className="mt-1" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-ink-700">Address</span>
              <textarea className="mt-1" rows={3} value={form.address} onChange={(e) => update('address', e.target.value)} />
            </label>

            <Button type="submit" disabled={submitting} className="w-full justify-center">
              {submitting ? 'Submitting...' : 'Submit application'}
            </Button>
            <Link to="/login" className="block text-center text-xs text-ink-500 hover:text-ink-800">
              ← Back to login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
