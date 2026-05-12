import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  FileSearch,
  Handshake,
  LineChart,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import landingHero from '../../assets/landing-hero.png';
import { env } from '../../lib/env';

const investorSteps = [
  'Create your investor profile and organization',
  'Define thesis, sectors, stage, geography, ticket size, and risk appetite',
  'Refresh AI-assisted startup matches',
  'Review diligence, claims, red flags, valuation, and readiness',
  'Save startups to pipeline, generate memos, and request information'
];

const founderSteps = [
  'Create founder and startup profiles',
  'Add team, metrics, fundraising, and valuation ask',
  'Upload data room documents for AI extraction',
  'Run Qwen diligence, readiness, and valuation checks',
  'Submit for admin approval and respond to investor requests'
];

export function PublicHomePage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <section className="relative min-h-[88vh] overflow-hidden bg-slate-950 text-white">
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src={landingHero} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,18,16,0.92)_0%,rgba(5,18,16,0.78)_40%,rgba(5,18,16,0.35)_76%,rgba(5,18,16,0.18)_100%)]" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link className="text-lg font-semibold tracking-normal" to="/">{env.appName}</Link>
          <nav className="flex items-center gap-3">
            <Link className="rounded-md px-3 py-2 text-sm text-white/85 hover:bg-white/10" to="/login">Log in</Link>
            <Link className="rounded-md bg-white px-3 py-2 text-sm font-medium text-[#123b34] shadow-sm hover:bg-[#f4efe6]" to="/register">Get started</Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl px-6 pb-20 pt-16 md:pt-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles size={16} /> AI deal intelligence for Southeast Asia
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-normal md:text-7xl">
              The private-market operating system for founders and investors.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Investor Marketplace helps startups become investment-ready and gives VCs, angels, and private investors an AI-assisted workflow for discovery, diligence, matching, memos, and requests.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#123b34] shadow-lg hover:bg-[#f4efe6]" to="/register">
                Start as founder or investor <ArrowRight size={16} />
              </Link>
              <Link className="rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15" to="/login">
                Open workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#ded4c4] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-4">
          <ProofPoint value="3" label="Role workspaces" />
          <ProofPoint value="10+" label="AI-assisted workflows" />
          <ProofPoint value="Qwen" label="LLM diligence engine" />
          <ProofPoint value="End-to-end" label="Founder to investor flow" />
        </div>
      </section>

      <Section eyebrow="The problem" title="Private-market diligence is still scattered across decks, spreadsheets, email threads, and instinct.">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<FileSearch size={22} />} title="Investors lose time validating basics" body="Startup profiles, claims, documents, valuation logic, and follow-up questions are rarely structured in one place." />
          <FeatureCard icon={<LineChart size={22} />} title="Founders do not know what is missing" body="Many promising companies approach investors before their metrics, data room, and fundraising story are ready." />
          <FeatureCard icon={<Handshake size={22} />} title="Matching is too shallow" body="Sector and stage are not enough. Investors need thesis fit, evidence quality, risk signals, and next actions." />
        </div>
      </Section>

      <section className="bg-[#102c27] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d5bc78]">The product</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal md:text-5xl">One workflow from startup profile to investment memo.</h2>
            <p className="mt-5 text-base leading-7 text-white/75">
              The platform turns founder inputs and uploaded documents into structured diligence, investor-ready readiness scores, Qwen-generated memos, and actionable matching.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DarkFeature icon={<BrainCircuit size={22} />} title="AI diligence" body="Extract claims, red flags, missing evidence, valuation concerns, and investor questions from startup data." />
            <DarkFeature icon={<BarChart3 size={22} />} title="Readiness scoring" body="Give founders practical coaching before they submit and help admins review quality faster." />
            <DarkFeature icon={<Users size={22} />} title="Investor matching" body="Match startups to investors using mandate, thesis, geography, stage, ticket size, traction, and AI explanation." />
            <DarkFeature icon={<FileSearch size={22} />} title="Memo generation" body="Generate investor screening memos with risks, traction, fundraising context, and next diligence steps." />
          </div>
        </div>
      </section>

      <Section eyebrow="For investors" title="A smarter way to find, screen, and manage startup opportunities.">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GuidePanel title="Investor workflow" steps={investorSteps} cta="Create investor account" to="/register" />
          <div className="grid gap-4">
            <FeatureCard icon={<Building2 size={22} />} title="Organization workspace" body="Create a VC, angel group, family office, CVC, accelerator, or private investor organization." />
            <FeatureCard icon={<Handshake size={22} />} title="Matched startups" body="Refresh matches and inspect why a company fits your mandate before saving it to pipeline." />
            <FeatureCard icon={<FileSearch size={22} />} title="Pipeline and memos" body="Move deals through stages, add notes, generate memos, and request missing information from founders." />
          </div>
        </div>
      </Section>

      <Section eyebrow="For founders" title="A fundraising readiness workspace before the first investor meeting.">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-4">
            <FeatureCard icon={<Users size={22} />} title="Founder and startup profile" body="Build a complete profile covering team, problem, solution, customers, traction, and fundraising." />
            <FeatureCard icon={<LockKeyhole size={22} />} title="Data room workflow" body="Upload supporting documents and control visibility before investors review sensitive materials." />
            <FeatureCard icon={<Sparkles size={22} />} title="AI fundraising coach" body="Get Qwen-generated improvement priorities, likely investor questions, and next-step guidance." />
          </div>
          <GuidePanel title="Founder workflow" steps={founderSteps} cta="Create founder account" to="/register" />
        </div>
      </Section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f2f]">Trust layer</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">Built for review, not blind automation.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              AI output is logged, reviewable, and paired with human approval workflows so admins, founders, and investors can move quickly without losing governance.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <FeatureCard icon={<ShieldCheck size={22} />} title="Role access" body="Separate admin, founder, and investor workspaces with protected routes and backend guards." />
            <FeatureCard icon={<CheckCircle2 size={22} />} title="Admin approval" body="Review users, investor organizations, startup submissions, visibility, AI runs, and audit logs." />
            <FeatureCard icon={<LockKeyhole size={22} />} title="Secure documents" body="Private uploads are served through authorized backend routes, not public links." />
            <FeatureCard icon={<BrainCircuit size={22} />} title="AI transparency" body="Qwen configuration, AI runs, claims, red flags, and generated memos are visible for review." />
          </div>
        </div>
      </section>

      <section className="bg-[#f6f1e8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f2f]">Rollout ready</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">Launch a guided marketplace, not just a database.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Founders know exactly what to complete. Investors know exactly how to evaluate. Admins can control the quality bar before startup data reaches the market.
            </p>
          </div>
          <div className="rounded-lg border border-[#ded4c4] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">Start using the platform</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create an account, choose founder or investor, complete onboarding, and move into your workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-md bg-[#173b34] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27]" to="/register">
                Create account <ArrowRight size={16} />
              </Link>
              <Link className="rounded-md border border-[#cfc5b5] bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-[#fbfaf6]" to="/login">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ded4c4] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>{env.appName} · {env.appRegion}</p>
          <div className="flex gap-4">
            <Link className="hover:text-[#173b34]" to="/terms">Terms</Link>
            <Link className="hover:text-[#173b34]" to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="bg-[#f6f1e8]">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6f2f]">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function ProofPoint({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-[#ded4c4] pl-4">
      <p className="text-2xl font-semibold text-[#173b34]">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[#ded4c4] bg-white p-5 shadow-sm">
      <div className="text-[#8b6f2f]">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function DarkFeature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-5">
      <div className="text-[#d5bc78]">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
    </div>
  );
}

function GuidePanel({ title, steps, cta, to }: { title: string; steps: string[]; cta: string; to: string }) {
  return (
    <div className="rounded-lg border border-[#ded4c4] bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <div className="flex gap-3 rounded-md border border-[#eee6d8] bg-[#fbfaf6] p-3 text-sm text-slate-700" key={step}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173b34] text-xs font-semibold text-white">{index + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <Link className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#173b34] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27]" to={to}>
        {cta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
