import { Link } from 'react-router-dom';

const content = {
  terms: {
    title: 'Terms of Use',
    body: [
      'Investor Marketplace provides workflow, matching, diligence, and AI-assisted analysis tools for founders, investors, and administrators.',
      'AI outputs are decision-support materials only and are not financial, legal, tax, or investment advice.',
      'Users are responsible for reviewing information, verifying evidence, and complying with applicable laws before making business or investment decisions.',
      'Uploaded documents must be owned by the user or shared with appropriate permission.'
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'The platform stores account information, startup profiles, investor preferences, uploaded documents, AI run logs, and workflow activity needed to operate the marketplace.',
      'Sensitive API keys must remain server-side. Uploaded documents are served through authorized backend routes only.',
      'Production operators should configure backups, access controls, SMTP, database security, Redis security, and monitoring before launch.',
      'Users may request account support or data updates through the platform administrator.'
    ]
  }
};

export function LegalPage({ type }: { type: 'terms' | 'privacy' }) {
  const page = content[type];
  return (
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-10 text-[#172033]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#ded4c4] bg-white/85 p-8 shadow-sm">
        <Link className="text-sm font-medium text-[#173b34]" to="/">Back</Link>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">{page.title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
          {page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>
    </main>
  );
}
