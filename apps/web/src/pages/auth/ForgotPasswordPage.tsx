import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../features/auth/auth-api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = await forgotPassword(email);
    setMessage(result.developmentToken ? `Development reset token: ${result.developmentToken}` : 'If the account exists, a reset link will be sent.');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e8] px-6 text-[#172033]">
      <form className="w-full max-w-md rounded-lg border border-[#ded4c4] bg-white/85 p-6 shadow-xl shadow-[#b9aa8f]/20" onSubmit={handleSubmit}>
        <p className="text-sm font-medium text-[#8b6f2f]">VC Intelligence</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Reset password</h1>
        <input className="mt-6 w-full rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#8b6f2f]" onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" value={email} />
        <button className="mt-4 w-full rounded-md bg-[#173b34] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27]" type="submit">Send reset link</button>
        {message ? <p className="mt-4 rounded-md border border-[#ded4c4] bg-[#fbfaf6] p-3 text-sm text-slate-700">{message}</p> : null}
        <Link className="mt-5 block text-sm font-medium text-[#173b34]" to="/login">Back to login</Link>
      </form>
    </main>
  );
}
