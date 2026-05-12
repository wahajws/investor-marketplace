import { Activity, ArrowRight, Database, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HealthPanel } from '../../components/health/HealthPanel';
import { env } from '../../lib/env';

export function PublicHomePage() {
  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#172033]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-[#d9d0c2] pb-5">
          <div>
            <p className="text-sm font-medium text-[#8b6f2f]">{env.appRegion}</p>
            <h1 className="text-xl font-semibold">{env.appName}</h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-[#eee5d8]" to="/login">
              Log in
            </Link>
            <Link className="rounded-md bg-[#173b34] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27]" to="/register">
              Register
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#c6b07a] bg-white/70 px-3 py-1 text-sm font-medium text-[#775f25]">
              Private market intelligence
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
              Startup diligence, verification, and investor matching for private-market teams.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              A premium operating layer for Malaysia and Southeast Asia VCs: founder profiles, valuation checks, AI-assisted diligence, document review, and investor-startup matching in one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-md bg-[#172033] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0f172a]" to="/register">
                Start setup <ArrowRight size={16} />
              </Link>
              <Link className="rounded-md border border-[#cfc5b5] bg-white/60 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-white" to="/login">
                Team login
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <HealthPanel />
            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureTile icon={<ShieldCheck size={20} />} label="Role control" />
              <FeatureTile icon={<Database size={20} />} label="MySQL-ready" />
              <FeatureTile icon={<Activity size={20} />} label="Health checks" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureTile({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-lg border border-[#ded4c4] bg-white/75 p-4 shadow-sm">
      <div className="mb-3 text-[#8b6f2f]">{icon}</div>
      <p className="text-sm font-medium text-slate-800">{label}</p>
    </div>
  );
}
