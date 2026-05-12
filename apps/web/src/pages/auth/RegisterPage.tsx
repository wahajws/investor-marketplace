import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { getDefaultDashboard } from '../../features/auth/RequireAuth';
import { ApiClientError } from '../../lib/api-client';
import type { UserRole } from '../../lib/auth-types';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'ADMIN'>>('FOUNDER');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await register({ email, password, role });
      navigate(getDefaultDashboard(user.roles), { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Unable to register.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e8] px-6 text-[#172033]">
      <form className="w-full max-w-md rounded-lg border border-[#ded4c4] bg-white/85 p-6 shadow-xl shadow-[#b9aa8f]/20" onSubmit={handleSubmit}>
        <p className="text-sm font-medium text-[#8b6f2f]">VC Intelligence</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Create a founder or investor workspace.</p>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#8b6f2f]" onChange={(e) => setEmail(e.target.value)} placeholder="Email" required type="email" value={email} />
          <select className="w-full rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#8b6f2f]" onChange={(e) => setRole(e.target.value as Exclude<UserRole, 'ADMIN'>)} value={role}>
            <option value="FOUNDER">Founder</option>
            <option value="INVESTOR">Investor</option>
          </select>
          <input className="w-full rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#8b6f2f]" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required type="password" value={password} />
          {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
          <button className="w-full rounded-md bg-[#173b34] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27] disabled:opacity-60" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </div>
        <p className="mt-5 text-sm text-slate-600">
          Already have an account? <Link className="font-medium text-[#173b34]" to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
