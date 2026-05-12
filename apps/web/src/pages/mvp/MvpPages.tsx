import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Handshake,
  Layers3,
  LineChart,
  LockKeyhole,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  Users
} from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, apiUpload } from '../../lib/api-client';
import { adminNav, founderNav, investorNav } from '../shared/RouteFactory';

type AnyRecord = Record<string, any>;
type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'password';
  options?: string[];
  placeholder?: string;
};

const sectors = ['Fintech', 'SaaS', 'Healthtech', 'Climate', 'E-commerce', 'AI', 'Edtech', 'Logistics'];
const stages = ['Idea', 'MVP', 'Pre-seed', 'Seed', 'Series A', 'Growth'];
const countries = ['Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines'];
const currencies = ['MYR', 'SGD', 'USD'];
const pipelineStages = ['NEW', 'SCREENING', 'INTERESTED', 'DILIGENCE', 'PARTNER_REVIEW', 'INVESTMENT_COMMITTEE', 'TERM_SHEET', 'INVESTED', 'REJECTED', 'ARCHIVED'];

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[#ded4c4] bg-white/85 p-5 shadow-sm ${className}`}>{children}</section>;
}

function PageHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-[#c6b07a] bg-white/70 px-3 py-1 text-sm font-medium text-[#775f25]">
          {icon}
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </header>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value ?? 0}</p>
        </div>
        <div className="rounded-md border border-[#d9d0c2] bg-[#f6f1e8] p-3 text-[#8b6f2f]">{icon}</div>
      </div>
    </Card>
  );
}

function InlineStat({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-[#ded4c4] bg-[#fbfaf6] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="text-[#8b6f2f]">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value ?? 0}</p>
    </div>
  );
}

function ActionButton({ children, onClick, tone = 'primary', disabled = false }: { children: ReactNode; onClick?: () => void; tone?: 'primary' | 'secondary' | 'danger'; disabled?: boolean }) {
  const styles = {
    primary: 'bg-[#173b34] text-white hover:bg-[#102c27]',
    secondary: 'border border-[#cfc5b5] bg-white/70 text-slate-800 hover:bg-white',
    danger: 'bg-red-700 text-white hover:bg-red-800'
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-sm disabled:opacity-50 ${styles[tone]}`} disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#d9d0c2] bg-[#fbfaf6] p-6 text-sm">
      <p className="font-medium text-slate-950">{title}</p>
      <p className="mt-1 text-slate-600">{description}</p>
    </div>
  );
}

function WorkflowChecklist({ items }: { items: Array<{ label: string; done: boolean; detail?: string }> }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-950">Launch checklist</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div className="flex items-start gap-3 rounded-md border border-[#ded4c4] bg-[#fbfaf6] p-3 text-sm" key={item.label}>
            <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
              {item.done ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            </span>
            <span>
              <span className="block font-medium text-slate-900">{item.label}</span>
              {item.detail ? <span className="mt-0.5 block text-slate-600">{item.detail}</span> : null}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AiDisclaimer() {
  return (
    <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      AI outputs are generated by Alibaba Qwen for diligence support only. Review source evidence and use human judgment before making fundraising or investment decisions.
    </div>
  );
}

function asArray(data: unknown): AnyRecord[] {
  return Array.isArray(data) ? data as AnyRecord[] : [];
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function DataTable({ rows, columns, actions }: { rows: AnyRecord[]; columns: Array<{ key: string; label: string; render?: (row: AnyRecord) => ReactNode }>; actions?: (row: AnyRecord) => ReactNode }) {
  if (!rows.length) return <EmptyState title="No records yet" description="Once data is created, it will appear here with actions for this workflow." />;
  return (
    <div className="overflow-hidden rounded-lg border border-[#ded4c4] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e5dccd] text-sm">
          <thead className="bg-[#f6f1e8] text-left text-slate-600">
            <tr>
              {columns.map((column) => <th className="px-4 py-3 font-medium" key={column.key}>{column.label}</th>)}
              {actions ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee6d8]">
            {rows.map((row) => (
              <tr key={row.id ?? JSON.stringify(row).slice(0, 40)}>
                {columns.map((column) => <td className="max-w-sm px-4 py-3 align-top text-slate-700" key={column.key}>{column.render ? column.render(row) : formatValue(row[column.key])}</td>)}
                {actions ? <td className="px-4 py-3 align-top"><div className="flex flex-wrap gap-2">{actions(row)}</div></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SmartForm({ title, description, fields, initial = {}, submitLabel = 'Save', onSubmit }: { title: string; description?: string; fields: Field[]; initial?: AnyRecord | null; submitLabel?: string; onSubmit: (value: AnyRecord) => Promise<unknown> }) {
  const [form, setForm] = useState<AnyRecord>(initial ?? {});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initial ?? {});
  }, [JSON.stringify(initial ?? {})]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const payload = Object.fromEntries(fields.map((field) => [field.name, form[field.name]]));
      await onSubmit(payload);
      setMessage('Saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save.');
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={submit}>
        {fields.map((field) => {
          const value = form[field.name] ?? '';
          const common = 'mt-1 w-full rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#8b6f2f]';
          return (
            <label className={field.type === 'textarea' ? 'md:col-span-2 text-sm font-medium text-slate-700' : 'text-sm font-medium text-slate-700'} key={field.name}>
              {field.label}
              {field.type === 'textarea' ? (
                <textarea className={`${common} min-h-28`} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} value={value} />
              ) : field.type === 'select' ? (
                <select className={common} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} value={value}>
                  <option value="">Select</option>
                  {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input className={common} onChange={(event) => setForm((current) => ({ ...current, [field.name]: field.type === 'number' ? Number(event.target.value) : event.target.value }))} placeholder={field.placeholder} type={field.type ?? 'text'} value={value} />
              )}
            </label>
          );
        })}
        <div className="md:col-span-2">
          <button className="rounded-md bg-[#173b34] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#102c27]" type="submit">{submitLabel}</button>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </div>
      </form>
    </Card>
  );
}

function JsonDetails({ data }: { data: unknown }) {
  return <pre className="max-h-96 overflow-auto rounded-md border border-[#e3d9c9] bg-[#fbfaf6] p-4 text-xs text-slate-800">{JSON.stringify(data, null, 2)}</pre>;
}

function useFirstCompany() {
  const companies = useQuery({ queryKey: ['companies'], queryFn: () => apiGet<AnyRecord[]>('/companies'), retry: false });
  const first = companies.data?.[0] ?? null;
  return { companies, company: first };
}

export function AdminHomePage() {
  const summary = useQuery({ queryKey: ['admin.summary'], queryFn: () => apiGet<AnyRecord>('/admin/dashboard/summary') });
  const pending = useQuery({ queryKey: ['admin.pending'], queryFn: () => apiGet<AnyRecord>('/admin/dashboard/pending-actions') });
  const risk = useQuery({ queryKey: ['admin.risk'], queryFn: () => apiGet<AnyRecord>('/admin/dashboard/risk-summary') });
  return (
    <DashboardShell title="Admin" navItems={adminNav}>
      <PageHeader eyebrow="Platform command center" title="Admin dashboard" description="Control users, startups, investors, approvals, AI review, settings, and audit activity from one operating console." icon={<ShieldCheck size={16} />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Users" value={summary.data?.users} icon={<Users size={22} />} />
        <MetricCard label="Startups" value={summary.data?.companies} icon={<Building2 size={22} />} />
        <MetricCard label="Organizations" value={summary.data?.organizations} icon={<Layers3 size={22} />} />
        <MetricCard label="Matches" value={summary.data?.matches} icon={<Handshake size={22} />} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WorkflowChecklist items={[
          { label: 'Review pending users', done: !pending.data?.users, detail: `${pending.data?.users ?? 0} users waiting` },
          { label: 'Approve investor organizations', done: !pending.data?.organizations, detail: `${pending.data?.organizations ?? 0} organizations waiting` },
          { label: 'Review submitted startups', done: !pending.data?.companies, detail: `${pending.data?.companies ?? 0} startups waiting` },
          { label: 'Investigate high-risk AI findings', done: !risk.data?.highRiskFlags, detail: `${risk.data?.highRiskFlags ?? 0} high-risk flags` }
        ]} />
        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Pending approvals</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InlineStat label="Users" value={pending.data?.users} icon={<Users size={18} />} />
            <InlineStat label="Investors" value={pending.data?.organizations} icon={<Building2 size={18} />} />
            <InlineStat label="Startups" value={pending.data?.companies} icon={<ClipboardCheck size={18} />} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Risk review</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InlineStat label="High-risk flags" value={risk.data?.highRiskFlags} icon={<AlertTriangle size={18} />} />
            <InlineStat label="Unsupported claims" value={risk.data?.unsupportedClaims} icon={<FileText size={18} />} />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

export function AdminUsersPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin.users'], queryFn: () => apiGet<AnyRecord[]>('/admin/users') });
  const update = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => apiPatch(`/admin/users/${id}/status`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin.users'] }) });
  return (
    <AdminSection title="User management" description="Approve, suspend, deactivate, and inspect users across founder, investor, and admin roles." icon={<Users size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'email', label: 'Email' }, { key: 'status', label: 'Status' }, { key: 'roles', label: 'Roles', render: (row) => row.roles?.map((r: AnyRecord) => r.role?.name).join(', ') }]} actions={(row) => <>
        <ActionButton onClick={() => update.mutate({ id: row.id, status: 'ACTIVE' })}>Approve</ActionButton>
        <ActionButton tone="secondary" onClick={() => update.mutate({ id: row.id, status: 'SUSPENDED' })}>Suspend</ActionButton>
        <ActionButton tone="danger" onClick={() => update.mutate({ id: row.id, status: 'DEACTIVATED' })}>Deactivate</ActionButton>
      </>} />
    </AdminSection>
  );
}

export function AdminOrganizationsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin.organizations'], queryFn: () => apiGet<AnyRecord[]>('/admin/organizations') });
  const update = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => apiPatch(`/admin/organizations/${id}/status`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin.organizations'] }) });
  return (
    <AdminSection title="Investor organizations" description="Approve VC firms, angel groups, family offices, CVCs, accelerators, and government-linked funds." icon={<Building2 size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'name', label: 'Organization' }, { key: 'type', label: 'Type' }, { key: 'country', label: 'Country' }, { key: 'status', label: 'Status' }]} actions={(row) => <>
        <ActionButton onClick={() => update.mutate({ id: row.id, status: 'ACTIVE' })}>Approve</ActionButton>
        <ActionButton tone="secondary" onClick={() => update.mutate({ id: row.id, status: 'SUSPENDED' })}>Suspend</ActionButton>
        <ActionButton tone="danger" onClick={() => update.mutate({ id: row.id, status: 'REJECTED' })}>Reject</ActionButton>
      </>} />
    </AdminSection>
  );
}

export function AdminCompaniesPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin.companies'], queryFn: () => apiGet<AnyRecord[]>('/admin/companies') });
  const status = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => apiPatch(`/admin/companies/${id}/status`, { status: value }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin.companies'] }) });
  const visibility = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => apiPatch(`/admin/companies/${id}/visibility`, { visibility: value }), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin.companies'] }) });
  return (
    <AdminSection title="Startup review" description="Review startup submissions, visibility, evidence quality, valuation risks, and investor-readiness status." icon={<ClipboardCheck size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'name', label: 'Startup' }, { key: 'sector', label: 'Sector' }, { key: 'stage', label: 'Stage' }, { key: 'status', label: 'Status' }, { key: 'visibility', label: 'Visibility' }]} actions={(row) => <>
        <ActionButton onClick={() => status.mutate({ id: row.id, value: 'APPROVED' })}>Approve</ActionButton>
        <ActionButton tone="secondary" onClick={() => visibility.mutate({ id: row.id, value: 'INVESTORS' })}>Investor visible</ActionButton>
        <ActionButton tone="danger" onClick={() => status.mutate({ id: row.id, value: 'REJECTED' })}>Reject</ActionButton>
      </>} />
    </AdminSection>
  );
}

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin.settings'], queryFn: () => apiGet<AnyRecord[]>('/admin/settings') });
  async function save(value: AnyRecord) {
    await apiPatch(`/admin/settings/${value.key}`, { value: JSON.parse(value.valueJson || '{}') });
    await qc.invalidateQueries({ queryKey: ['admin.settings'] });
  }
  return (
    <AdminSection title="Platform settings" description="Control sectors, stages, countries, scoring weights, matching weights, valuation assumptions, document requirements, and visibility rules." icon={<LockKeyhole size={16} />}>
      <SmartForm title="Update setting" description="Use JSON for configurable rules. Example key: matching.weights, readiness.weights, valuation.assumptions, document.requirements." fields={[{ name: 'key', label: 'Setting key' }, { name: 'valueJson', label: 'Value JSON', type: 'textarea', placeholder: '{\"sectorFit\":20}' }]} onSubmit={save} />
      <div className="mt-6">
        <DataTable rows={asArray(query.data)} columns={[{ key: 'key', label: 'Key' }, { key: 'valueJson', label: 'Value' }]} />
      </div>
    </AdminSection>
  );
}

export function AdminAuditPage() {
  const query = useQuery({ queryKey: ['admin.audit'], queryFn: () => apiGet<AnyRecord[]>('/admin/audit-logs') });
  return (
    <AdminSection title="Audit logs" description="Governance trail for login, profile, document, AI, matching, admin approval, and workflow events." icon={<FileText size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'action', label: 'Action' }, { key: 'entityType', label: 'Entity' }, { key: 'entityId', label: 'Entity ID' }, { key: 'createdAt', label: 'Timestamp' }]} />
    </AdminSection>
  );
}

export function AdminAiRunsPage() {
  const query = useQuery({ queryKey: ['admin.aiRuns'], queryFn: () => apiGet<AnyRecord[]>('/admin/ai/runs') });
  return (
    <AdminSection title="AI review" description="Review AI extraction, diligence, valuation explanation, red-flag, memo, and matching outputs before relying on them." icon={<Sparkles size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'task', label: 'Task' }, { key: 'model', label: 'Model' }, { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Created' }]} />
      <div className="mt-6"><JsonDetails data={query.data ?? []} /></div>
    </AdminSection>
  );
}

function AdminSection({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <DashboardShell title="Admin" navItems={adminNav}>
      <PageHeader eyebrow="Admin control" title={title} description={description} icon={icon} />
      {children}
    </DashboardShell>
  );
}

export function FounderHomePage() {
  const summary = useQuery({ queryKey: ['founder.summary'], queryFn: () => apiGet<AnyRecord>('/founder/dashboard/summary') });
  const recommendations = useQuery({ queryKey: ['founder.recommendations'], queryFn: () => apiGet<AnyRecord>('/founder/dashboard/recommendations') });
  const interest = useQuery({ queryKey: ['founder.interest'], queryFn: () => apiGet<AnyRecord>('/founder/dashboard/investor-interest') });
  return (
    <DashboardShell title="Founder" navItems={founderNav}>
      <PageHeader eyebrow="Founder workspace" title="Investment readiness dashboard" description="Build your startup profile, upload supporting documents, run AI diligence checks, understand valuation reasonableness, and prepare for matched investors." icon={<LineChart size={16} />} />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Companies" value={summary.data?.companies} icon={<Building2 size={22} />} />
        <MetricCard label="Readiness score" value={summary.data?.readinessScore ?? 'Not run'} icon={<BarChart3 size={22} />} />
        <MetricCard label="Investor interest" value={`${interest.data?.matches ?? 0} matches`} icon={<Handshake size={22} />} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WorkflowChecklist items={[
          { label: 'Create startup profile', done: Boolean(summary.data?.latestCompany), detail: summary.data?.latestCompany?.name ?? 'Required before investor review' },
          { label: 'Add metrics and fundraising', done: !(recommendations.data?.recommendations ?? []).some((item: string) => item.includes('metrics') || item.includes('fundraising')), detail: 'Needed for valuation and readiness scoring' },
          { label: 'Upload diligence documents', done: !(recommendations.data?.recommendations ?? []).some((item: string) => item.includes('Upload')), detail: 'Pitch deck, financials, registration, and evidence' },
          { label: 'Submit for admin approval', done: ['SUBMITTED', 'ADMIN_REVIEW', 'APPROVED'].includes(summary.data?.latestCompany?.status), detail: summary.data?.latestCompany?.status ?? 'Draft' }
        ]} />
        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Recommended next actions</h3>
          <div className="mt-4 grid gap-3">
            {(recommendations.data?.recommendations?.length ? recommendations.data.recommendations : ['Run AI readiness once your profile and documents are complete.']).map((item: string) => (
              <div className="rounded-md border border-[#ded4c4] bg-[#fbfaf6] p-4 text-sm text-slate-700" key={item}>{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

export function FounderProfilePage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['founder.profile'], queryFn: () => apiGet<AnyRecord | null>('/founder/profile') });
  return (
    <FounderSection title="Founder profile" description="Complete your personal founder information so investors can assess experience, credibility, and role clarity." icon={<Users size={16} />}>
      <SmartForm title="Personal founder details" fields={[
        { name: 'fullName', label: 'Full name' }, { name: 'phone', label: 'Phone number' }, { name: 'country', label: 'Country', type: 'select', options: countries }, { name: 'city', label: 'City' }, { name: 'linkedinUrl', label: 'LinkedIn URL' }, { name: 'role', label: 'Role in company' }, { name: 'biography', label: 'Founder biography', type: 'textarea' }, { name: 'experience', label: 'Experience summary', type: 'textarea' }, { name: 'education', label: 'Education', type: 'textarea' }
      ]} initial={query.data} onSubmit={async (value) => { await apiPatch('/founder/profile', value); await qc.invalidateQueries({ queryKey: ['founder.profile'] }); }} />
    </FounderSection>
  );
}

export function FounderCompanyPage() {
  const qc = useQueryClient();
  const { companies, company } = useFirstCompany();
  const submit = useMutation({ mutationFn: () => company ? apiPost(`/companies/${company.id}/submit`) : Promise.resolve(), onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }) });
  return (
    <FounderSection title="Company profile" description="Create and maintain the startup profile investors and admins will review." icon={<Building2 size={16} />}>
      <SmartForm title={company ? 'Update startup profile' : 'Create startup profile'} fields={[
        { name: 'name', label: 'Company name' }, { name: 'registrationNumber', label: 'Registration number' }, { name: 'country', label: 'Country', type: 'select', options: countries }, { name: 'city', label: 'City' }, { name: 'sector', label: 'Sector', type: 'select', options: sectors }, { name: 'businessModel', label: 'Business model' }, { name: 'stage', label: 'Startup stage', type: 'select', options: stages }, { name: 'website', label: 'Website' }, { name: 'description', label: 'Company description', type: 'textarea' }, { name: 'problem', label: 'Problem statement', type: 'textarea' }, { name: 'solution', label: 'Solution', type: 'textarea' }, { name: 'targetCustomers', label: 'Target customers', type: 'textarea' }
      ]} initial={company} onSubmit={async (value) => { if (company) await apiPatch(`/companies/${company.id}`, value); else await apiPost('/companies', value); await qc.invalidateQueries({ queryKey: ['companies'] }); }} />
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-slate-950">Review workflow</h3>
        <p className="mt-1 text-sm text-slate-600">Submit your company when profile, metrics, fundraising, and documents are ready for admin review.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton disabled={!company} onClick={() => submit.mutate()}><Send size={16} /> Submit for approval</ActionButton>
          <ActionButton disabled={!company} tone="secondary" onClick={() => company && apiPost(`/companies/${company.id}/matches/refresh`)}><Handshake size={16} /> Refresh investor matches</ActionButton>
        </div>
      </Card>
      <div className="mt-6"><DataTable rows={asArray(companies.data)} columns={[{ key: 'name', label: 'Startup' }, { key: 'sector', label: 'Sector' }, { key: 'stage', label: 'Stage' }, { key: 'status', label: 'Status' }, { key: 'visibility', label: 'Visibility' }]} /></div>
    </FounderSection>
  );
}

export function FounderTeamPage() {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const query = useQuery({ queryKey: ['company.team', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord[]>(`/companies/${company?.id}/team`) });
  return (
    <FounderSection title="Team and cap table" description="Add co-founders, key hires, advisors, board members, and ownership details." icon={<Users size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="Team management becomes available after a startup profile exists." /> : <>
        <SmartForm title="Add team member" fields={[{ name: 'name', label: 'Name' }, { name: 'role', label: 'Role' }, { name: 'email', label: 'Email' }, { name: 'ownership', label: 'Ownership %', type: 'number' }, { name: 'bio', label: 'Bio', type: 'textarea' }]} onSubmit={async (value) => { await apiPost(`/companies/${company.id}/team`, value); await qc.invalidateQueries({ queryKey: ['company.team', company.id] }); }} />
        <div className="mt-6"><DataTable rows={asArray(query.data)} columns={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'ownership', label: 'Ownership' }, { key: 'email', label: 'Email' }]} actions={(row) => <ActionButton tone="danger" onClick={async () => { await apiDelete(`/companies/${company.id}/team/${row.id}`); await qc.invalidateQueries({ queryKey: ['company.team', company.id] }); }}>Remove</ActionButton>} /></div>
      </>}
    </FounderSection>
  );
}

export function FounderMetricsPage() {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const query = useQuery({ queryKey: ['company.metrics', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord | null>(`/companies/${company?.id}/metrics`) });
  return (
    <FounderSection title="Traction and financial metrics" description="Enter customer, revenue, growth, margin, CAC/LTV proxy, burn, and runway metrics for scoring and valuation." icon={<BarChart3 size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="Metrics are connected to your startup profile." /> : <SmartForm title="Company metrics" fields={[
        { name: 'customerCount', label: 'Customer count', type: 'number' }, { name: 'payingCustomerCount', label: 'Paying customers', type: 'number' }, { name: 'monthlyActiveUsers', label: 'Monthly active users', type: 'number' }, { name: 'monthlyRecurringRevenue', label: 'MRR', type: 'number' }, { name: 'annualRecurringRevenue', label: 'ARR', type: 'number' }, { name: 'annualRevenue', label: 'Annual revenue', type: 'number' }, { name: 'revenueGrowthRate', label: 'Revenue growth %', type: 'number' }, { name: 'churnRate', label: 'Churn %', type: 'number' }, { name: 'grossMargin', label: 'Gross margin %', type: 'number' }, { name: 'burnRate', label: 'Monthly burn', type: 'number' }, { name: 'runwayMonths', label: 'Runway months', type: 'number' }, { name: 'currency', label: 'Currency', type: 'select', options: currencies }
      ]} initial={query.data} onSubmit={async (value) => { await apiPut(`/companies/${company.id}/metrics`, value); await qc.invalidateQueries({ queryKey: ['company.metrics', company.id] }); }} />}
    </FounderSection>
  );
}

export function FounderFundraisingPage() {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const query = useQuery({ queryKey: ['company.fundraising', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord | null>(`/companies/${company?.id}/fundraising`) });
  return (
    <FounderSection title="Fundraising and valuation ask" description="Capture the raise amount, claimed valuation, instrument, previous funding, current investors, and use of funds." icon={<LineChart size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="Fundraising details are connected to your startup profile." /> : <SmartForm title="Fundraising details" fields={[
        { name: 'amountRaising', label: 'Amount raising', type: 'number' }, { name: 'claimedValuation', label: 'Claimed valuation', type: 'number' }, { name: 'currency', label: 'Currency', type: 'select', options: currencies }, { name: 'instrument', label: 'Instrument', type: 'select', options: ['Equity', 'SAFE', 'Convertible Note', 'Grant', 'Other'] }, { name: 'previousFunding', label: 'Previous funding', type: 'number' }, { name: 'currentInvestors', label: 'Existing investors', type: 'textarea' }, { name: 'useOfFunds', label: 'Use of funds', type: 'textarea' }
      ]} initial={query.data} onSubmit={async (value) => { await apiPut(`/companies/${company.id}/fundraising`, value); await qc.invalidateQueries({ queryKey: ['company.fundraising', company.id] }); }} />}
    </FounderSection>
  );
}

export function FounderDocumentsPage() {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const docs = useQuery({ queryKey: ['company.documents', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord[]>(`/companies/${company?.id}/documents`) });
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Pitch deck');
  const [visibility, setVisibility] = useState('PRIVATE');
  async function uploadDoc(event: FormEvent) {
    event.preventDefault();
    if (!company || !file) return;
    const data = new FormData();
    data.set('file', file);
    data.set('category', category);
    data.set('visibility', visibility);
    await apiUpload(`/companies/${company.id}/documents`, data);
    setFile(null);
    await qc.invalidateQueries({ queryKey: ['company.documents', company.id] });
  }
  return (
    <FounderSection title="Startup data room" description="Upload evidence documents, set visibility, process extraction, and prepare data room access for investors." icon={<Upload size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="Documents are uploaded against a startup profile." /> : <>
        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Upload supporting document</h3>
          <form className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_180px_auto]" onSubmit={uploadDoc}>
            <input className="rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
            <select className="rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm" onChange={(event) => setCategory(event.target.value)} value={category}>
              {['Pitch deck', 'Financial statement', 'Bank statement', 'Revenue report', 'Cap table', 'Customer contract', 'Grant letter', 'Company registration document', 'Investor update', 'Product screenshot', 'Other'].map((option) => <option key={option}>{option}</option>)}
            </select>
            <select className="rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm" onChange={(event) => setVisibility(event.target.value)} value={visibility}>
              <option value="PRIVATE">Private</option>
              <option value="INVESTORS">Investors</option>
            </select>
            <button className="rounded-md bg-[#173b34] px-4 py-2 text-sm font-medium text-white" type="submit">Upload</button>
          </form>
        </Card>
        <div className="mt-6"><DataTable rows={asArray(docs.data)} columns={[{ key: 'filename', label: 'File' }, { key: 'category', label: 'Category' }, { key: 'visibility', label: 'Visibility' }, { key: 'status', label: 'Status' }]} actions={(row) => <>
          <ActionButton onClick={async () => { await apiPost(`/documents/${row.id}/process`); await qc.invalidateQueries({ queryKey: ['company.documents', company.id] }); }}>Process AI</ActionButton>
          <ActionButton tone="danger" onClick={async () => { await apiDelete(`/documents/${row.id}`); await qc.invalidateQueries({ queryKey: ['company.documents', company.id] }); }}>Delete</ActionButton>
        </>} /></div>
      </>}
    </FounderSection>
  );
}

export function FounderAiPage() {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const [coach, setCoach] = useState<AnyRecord | null>(null);
  const [questions, setQuestions] = useState<AnyRecord | null>(null);
  const [aiError, setAiError] = useState('');
  const status = useQuery({ queryKey: ['company.ai.status', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord>(`/companies/${company?.id}/ai/status`) });
  const claims = useQuery({ queryKey: ['company.claims', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord[]>(`/companies/${company?.id}/claims`) });
  const flags = useQuery({ queryKey: ['company.flags', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord[]>(`/companies/${company?.id}/red-flags`) });
  return (
    <FounderSection title="AI diligence feedback" description="Run AI extraction, claim checks, red-flag analysis, and founder improvement recommendations. AI output remains preliminary and human-reviewable." icon={<Sparkles size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="AI diligence runs against a startup profile and documents." /> : <>
        <AiDisclaimer />
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Qwen status" value={status.data?.qwenConfigured ? 'Ready' : 'Missing key'} icon={<Sparkles size={22} />} />
          <MetricCard label="Claims" value={status.data?.claims} icon={<ClipboardCheck size={22} />} />
          <MetricCard label="Red flags" value={status.data?.redFlags} icon={<AlertTriangle size={22} />} />
        </div>
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-slate-950">AI actions</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton onClick={async () => { try { setAiError(''); await apiPost(`/companies/${company.id}/ai/run-extraction`); await qc.invalidateQueries(); } catch (err) { setAiError(err instanceof Error ? err.message : 'AI extraction failed.'); } }}><Sparkles size={16} /> Run extraction</ActionButton>
            <ActionButton onClick={async () => { try { setAiError(''); await apiPost(`/companies/${company.id}/ai/run-diligence`); await qc.invalidateQueries(); } catch (err) { setAiError(err instanceof Error ? err.message : 'AI diligence failed.'); } }}><ShieldCheck size={16} /> Run diligence</ActionButton>
            <ActionButton tone="secondary" onClick={async () => { try { setAiError(''); setCoach(await apiPost<AnyRecord>(`/companies/${company.id}/ai/founder-coach`)); } catch (err) { setAiError(err instanceof Error ? err.message : 'Founder coaching failed.'); } }}><LineChart size={16} /> Founder coach</ActionButton>
            <ActionButton tone="secondary" onClick={async () => { try { setAiError(''); setQuestions(await apiPost<AnyRecord>(`/companies/${company.id}/ai/diligence-questions`)); } catch (err) { setAiError(err instanceof Error ? err.message : 'Question drafting failed.'); } }}><FileText size={16} /> Draft questions</ActionButton>
          </div>
          {aiError ? <p className="mt-3 text-sm text-red-700">{aiError}</p> : null}
        </Card>
        {(coach || questions) ? <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {coach ? <Card><h3 className="mb-4 text-lg font-semibold text-slate-950">Founder coach</h3><JsonDetails data={coach} /></Card> : null}
          {questions ? <Card><h3 className="mb-4 text-lg font-semibold text-slate-950">Diligence questions</h3><JsonDetails data={questions} /></Card> : null}
        </div> : null}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card><h3 className="mb-4 text-lg font-semibold text-slate-950">Claims</h3><DataTable rows={asArray(claims.data)} columns={[{ key: 'claimType', label: 'Type' }, { key: 'claimText', label: 'Claim' }, { key: 'verificationStatus', label: 'Status' }, { key: 'severity', label: 'Severity' }]} /></Card>
          <Card><h3 className="mb-4 text-lg font-semibold text-slate-950">Red flags</h3><DataTable rows={asArray(flags.data)} columns={[{ key: 'category', label: 'Category' }, { key: 'severity', label: 'Severity' }, { key: 'explanation', label: 'Explanation' }]} /></Card>
        </div>
      </>}
    </FounderSection>
  );
}

export function FounderValuationReadinessPage({ mode }: { mode: 'valuation' | 'readiness' }) {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const latest = useQuery({ queryKey: ['company', mode, company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord | null>(mode === 'valuation' ? `/companies/${company?.id}/valuation/latest` : `/companies/${company?.id}/readiness/latest`) });
  return (
    <FounderSection title={mode === 'valuation' ? 'Valuation reasonableness' : 'Investor readiness score'} description={mode === 'valuation' ? 'Run deterministic valuation formulas and get an AI-assisted explanation of whether the claimed valuation is reasonable.' : 'Calculate readiness across profile, documents, metrics, traction, fundraising, governance, risk, and investor-fit categories.'} icon={mode === 'valuation' ? <LineChart size={16} /> : <CheckCircle2 size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="This analysis is connected to your startup profile." /> : <>
        <AiDisclaimer />
        <Card>
          <ActionButton onClick={async () => { await apiPost(mode === 'valuation' ? `/companies/${company.id}/valuation/run` : `/companies/${company.id}/readiness/calculate`); await qc.invalidateQueries(); }}>
            {mode === 'valuation' ? 'Run valuation analysis' : 'Calculate readiness'}
          </ActionButton>
        </Card>
        <div className="mt-6"><JsonDetails data={latest.data ?? { status: 'No analysis run yet.' }} /></div>
      </>}
    </FounderSection>
  );
}

export function FounderMatchesPage() {
  const qc = useQueryClient();
  const { company } = useFirstCompany();
  const query = useQuery({ queryKey: ['company.matches', company?.id], enabled: !!company, queryFn: () => apiGet<AnyRecord[]>(`/companies/${company?.id}/matched-investors`) });
  return (
    <FounderSection title="Matched investors" description="See investor organizations that fit your sector, stage, geography, ticket size, risk, and thesis profile." icon={<Handshake size={16} />}>
      {!company ? <EmptyState title="Create a company first" description="Investor matching requires a startup profile." /> : <>
        <Card><ActionButton onClick={async () => { await apiPost(`/companies/${company.id}/matches/refresh`); await qc.invalidateQueries({ queryKey: ['company.matches', company.id] }); }}>Refresh matches</ActionButton></Card>
        <div className="mt-6"><DataTable rows={asArray(query.data)} columns={[{ key: 'organization', label: 'Investor', render: (row) => row.organization?.name }, { key: 'totalScore', label: 'Score' }, { key: 'fitLevel', label: 'Fit' }, { key: 'explanation', label: 'Explanation' }]} /></div>
      </>}
    </FounderSection>
  );
}

function FounderSection({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <DashboardShell title="Founder" navItems={founderNav}>
      <PageHeader eyebrow="Founder module" title={title} description={description} icon={icon} />
      {children}
    </DashboardShell>
  );
}

export function InvestorHomePage() {
  const summary = useQuery({ queryKey: ['investor.summary'], queryFn: () => apiGet<AnyRecord>('/investor/dashboard/summary') });
  const pipeline = useQuery({ queryKey: ['investor.pipelineSummary'], queryFn: () => apiGet<AnyRecord[]>('/investor/dashboard/pipeline-summary') });
  const profile = useQuery({ queryKey: ['investor.profile.status'], queryFn: () => apiGet<AnyRecord | null>('/investor/profile') });
  const preferences = useQuery({ queryKey: ['investor.preferences.status'], queryFn: () => apiGet<AnyRecord | null>('/investor/preferences') });
  return (
    <DashboardShell title="Investor" navItems={investorNav}>
      <PageHeader eyebrow="Investor workspace" title="Deal intelligence dashboard" description="Review matched startups, manage diligence, save deals to pipeline, request information, and generate screening memos." icon={<Search size={16} />} />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Matches" value={summary.data?.matches} icon={<Handshake size={22} />} />
        <MetricCard label="Pipeline items" value={summary.data?.pipelineItems} icon={<Layers3 size={22} />} />
        <MetricCard label="Organization" value={summary.data?.organizationId ? 'Active' : 'Missing'} icon={<Building2 size={22} />} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <WorkflowChecklist items={[
          { label: 'Complete investor profile', done: Boolean(profile.data?.fullName || profile.data?.title), detail: 'Used in founder-facing context and admin review' },
          { label: 'Create or join organization', done: Boolean(summary.data?.organizationId), detail: summary.data?.organizationId ? 'Organization linked' : 'Required before pipeline work' },
          { label: 'Define investment preferences', done: Boolean(preferences.data?.thesis || preferences.data?.sectors?.length), detail: 'Powers matching and recommendations' },
          { label: 'Build active pipeline', done: Boolean(summary.data?.pipelineItems), detail: `${summary.data?.pipelineItems ?? 0} saved deals` }
        ]} />
        <Card>
          <h3 className="text-lg font-semibold text-slate-950">Pipeline by stage</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {asArray(pipeline.data).length ? asArray(pipeline.data).map((item) => <div className="rounded-md border border-[#ded4c4] bg-[#fbfaf6] p-4" key={item.stage}><p className="text-sm text-slate-500">{item.stage}</p><p className="mt-1 text-2xl font-semibold">{item._count}</p></div>) : <EmptyState title="No saved deals yet" description="Discover approved startups, then move strong fits into your pipeline." />}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

export function InvestorProfilePage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['investor.profile'], queryFn: () => apiGet<AnyRecord | null>('/investor/profile') });
  return (
    <InvestorSection title="Investor profile" description="Create your investor identity and credentials for founder-facing introductions and team diligence." icon={<Users size={16} />}>
      <SmartForm title="Personal investor details" fields={[{ name: 'fullName', label: 'Investor name' }, { name: 'phone', label: 'Phone' }, { name: 'country', label: 'Country', type: 'select', options: countries }, { name: 'city', label: 'City' }, { name: 'linkedinUrl', label: 'LinkedIn URL' }, { name: 'title', label: 'Title' }, { name: 'bio', label: 'Short bio', type: 'textarea' }]} initial={query.data} onSubmit={async (value) => { await apiPatch('/investor/profile', value); await qc.invalidateQueries({ queryKey: ['investor.profile'] }); }} />
    </InvestorSection>
  );
}

export function InvestorOrganizationPage() {
  const qc = useQueryClient();
  const summary = useQuery({ queryKey: ['investor.summary'], queryFn: () => apiGet<AnyRecord>('/investor/dashboard/summary') });
  return (
    <InvestorSection title="Organization profile" description="Set up the VC firm, angel group, family office, accelerator, or fund profile behind your investor account." icon={<Building2 size={16} />}>
      <SmartForm title="Create investor organization" fields={[{ name: 'name', label: 'Organization name' }, { name: 'type', label: 'Investor type', type: 'select', options: ['VC', 'ANGEL', 'FAMILY_OFFICE', 'CVC', 'ACCELERATOR', 'GOVERNMENT_LINKED', 'OTHER'] }, { name: 'country', label: 'Country', type: 'select', options: countries }, { name: 'city', label: 'City' }, { name: 'website', label: 'Website' }, { name: 'description', label: 'Description', type: 'textarea' }]} onSubmit={async (value) => { await apiPost('/organizations', value); await qc.invalidateQueries({ queryKey: ['investor.summary'] }); }} />
      <div className="mt-6"><JsonDetails data={summary.data ?? {}} /></div>
    </InvestorSection>
  );
}

export function InvestorPreferencesPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['investor.preferences'], queryFn: () => apiGet<AnyRecord | null>('/investor/preferences') });
  return (
    <InvestorSection title="Investment preferences" description="Define the thesis, sectors, stages, geographies, ticket size, risk profile, and mandate filters that power matching." icon={<BarChart3 size={16} />}>
      <SmartForm title="Matching preferences" fields={[
        { name: 'thesis', label: 'Investment thesis', type: 'textarea' }, { name: 'sectorsText', label: 'Preferred sectors, comma separated', placeholder: 'Fintech, SaaS' }, { name: 'stagesText', label: 'Preferred stages, comma separated', placeholder: 'Seed, Series A' }, { name: 'geographiesText', label: 'Preferred geographies, comma separated', placeholder: 'Malaysia, Singapore' }, { name: 'excludedSectorsText', label: 'Excluded sectors, comma separated' }, { name: 'minTicketSize', label: 'Minimum ticket size', type: 'number' }, { name: 'maxTicketSize', label: 'Maximum ticket size', type: 'number' }, { name: 'revenueRequirement', label: 'Revenue requirement', type: 'number' }, { name: 'riskPreference', label: 'Risk preference', type: 'select', options: ['Low', 'Moderate', 'High'] }, { name: 'leadPreference', label: 'Lead/follow preference', type: 'select', options: ['Lead', 'Follow', 'Both'] }
      ]} initial={{ ...query.data, sectorsText: (query.data?.sectors ?? []).join(', '), stagesText: (query.data?.stages ?? []).join(', '), geographiesText: (query.data?.geographies ?? []).join(', '), excludedSectorsText: (query.data?.excludedSectors ?? []).join(', ') }} onSubmit={async (value) => {
        const payload: AnyRecord = { ...value, sectors: splitList(value.sectorsText), stages: splitList(value.stagesText), geographies: splitList(value.geographiesText), excludedSectors: splitList(value.excludedSectorsText) };
        delete payload.sectorsText; delete payload.stagesText; delete payload.geographiesText; delete payload.excludedSectorsText;
        await apiPatch('/investor/preferences', payload);
        await qc.invalidateQueries({ queryKey: ['investor.preferences'] });
      }} />
    </InvestorSection>
  );
}

export function InvestorDiscoverPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['investor.discover'], queryFn: () => apiGet<AnyRecord[]>('/companies') });
  const [requestByCompany, setRequestByCompany] = useState<Record<string, string>>({});
  return (
    <InvestorSection title="Startup discovery" description="Search approved startups, inspect diligence readiness, save companies to pipeline, request information, and generate memos." icon={<Search size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'name', label: 'Startup' }, { key: 'sector', label: 'Sector' }, { key: 'stage', label: 'Stage' }, { key: 'country', label: 'Country' }, { key: 'description', label: 'Summary' }]} actions={(row) => <>
        <ActionButton onClick={async () => { await apiPost('/pipeline/items', { companyId: row.id, stage: 'NEW' }); await qc.invalidateQueries(); }}>Save</ActionButton>
        <ActionButton tone="secondary" onClick={async () => { await apiPost(`/companies/${row.id}/memos`); await qc.invalidateQueries(); }}>Memo</ActionButton>
        <input className="w-48 rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-3 py-2 text-sm" onChange={(event) => setRequestByCompany((current) => ({ ...current, [row.id]: event.target.value }))} placeholder="Request info..." value={requestByCompany[row.id] ?? ''} />
        <ActionButton tone="secondary" onClick={async () => { await apiPost(`/companies/${row.id}/requests`, { title: 'Investor information request', body: requestByCompany[row.id] || 'Please share more diligence information.' }); await qc.invalidateQueries(); }}>Request</ActionButton>
      </>} />
    </InvestorSection>
  );
}

export function InvestorMatchesPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['investor.matches'], queryFn: () => apiGet<AnyRecord[]>('/investor/matched-startups') });
  return (
    <InvestorSection title="Matched startups" description="Review AI-assisted and deterministic match scores, explanations, and next-best action for each startup." icon={<Handshake size={16} />}>
      <AiDisclaimer />
      <Card className="mb-6"><ActionButton onClick={async () => { await apiPost('/matches/refresh', {}); await qc.invalidateQueries({ queryKey: ['investor.matches'] }); }}>Refresh startup matches</ActionButton></Card>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'company', label: 'Startup', render: (row) => row.company?.name }, { key: 'totalScore', label: 'Score' }, { key: 'fitLevel', label: 'Fit' }, { key: 'explanation', label: 'Reasoning' }]} actions={(row) => <ActionButton onClick={async () => { await apiPost('/pipeline/items', { companyId: row.companyId, stage: 'SCREENING' }); await qc.invalidateQueries(); }}>Move to pipeline</ActionButton>} />
    </InvestorSection>
  );
}

export function InvestorPipelinePage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['pipeline'], queryFn: () => apiGet<AnyRecord[]>('/pipeline') });
  return (
    <InvestorSection title="Deal pipeline" description="Manage saved startups through screening, diligence, partner review, investment committee, term sheet, invested, rejected, or archived stages." icon={<Layers3 size={16} />}>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'company', label: 'Startup', render: (row) => row.company?.name }, { key: 'stage', label: 'Stage' }, { key: 'rating', label: 'Rating' }, { key: 'nextActionAt', label: 'Next action' }]} actions={(row) => <>
        <select className="rounded-md border border-[#d5cbbb] bg-[#fbfaf6] px-2 py-2 text-sm" onChange={async (event) => { await apiPatch(`/pipeline/items/${row.id}`, { stage: event.target.value }); await qc.invalidateQueries({ queryKey: ['pipeline'] }); }} value={row.stage}>{pipelineStages.map((stage) => <option key={stage}>{stage}</option>)}</select>
        <ActionButton tone="secondary" onClick={async () => { await apiPost(`/pipeline/items/${row.id}/notes`, { body: 'Internal diligence note created from MVP workspace.' }); await qc.invalidateQueries({ queryKey: ['pipeline'] }); }}>Add note</ActionButton>
        <ActionButton onClick={async () => { await apiPost(`/companies/${row.companyId}/memos`); await qc.invalidateQueries(); }}>Generate memo</ActionButton>
      </>} />
    </InvestorSection>
  );
}

export function RequestsPage({ role }: { role: 'Founder' | 'Investor' }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['requests'], queryFn: () => apiGet<AnyRecord[]>('/requests') });
  const navItems = role === 'Founder' ? founderNav : investorNav;
  return (
    <DashboardShell title={role} navItems={navItems}>
      <PageHeader eyebrow={`${role} workflow`} title="Information requests" description="Manage diligence questions, founder responses, status updates, and requested document workflow." icon={<Bell size={16} />} />
      <DataTable rows={asArray(query.data)} columns={[{ key: 'company', label: 'Startup', render: (row) => row.company?.name }, { key: 'title', label: 'Title' }, { key: 'body', label: 'Request' }, { key: 'status', label: 'Status' }]} actions={(row) => <>
        <ActionButton onClick={async () => { await apiPost(`/requests/${row.id}/responses`, { body: role === 'Founder' ? 'Founder response added from MVP workspace.' : 'Investor follow-up added from MVP workspace.' }); await qc.invalidateQueries({ queryKey: ['requests'] }); }}>Respond</ActionButton>
        <ActionButton tone="secondary" onClick={async () => { await apiPatch(`/requests/${row.id}/status`, { status: 'RESOLVED' }); await qc.invalidateQueries({ queryKey: ['requests'] }); }}>Resolve</ActionButton>
      </>} />
    </DashboardShell>
  );
}

export function NotificationsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['notifications'], queryFn: () => apiGet<AnyRecord[]>('/notifications') });
  return (
    <DashboardShell title="Notifications" navItems={[{ label: 'Notifications', to: '/notifications' }, { label: 'Account', to: '/account' }]}>
      <PageHeader eyebrow="Activity inbox" title="Notifications" description="In-app notices for account approval, startup approval, matches, requests, founder responses, AI completion, and admin review." icon={<Bell size={16} />} />
      <Card className="mb-6"><ActionButton onClick={async () => { await apiPatch('/notifications/read-all'); await qc.invalidateQueries({ queryKey: ['notifications'] }); }}>Mark all read</ActionButton></Card>
      <DataTable rows={asArray(query.data)} columns={[{ key: 'title', label: 'Title' }, { key: 'body', label: 'Body' }, { key: 'readAt', label: 'Read' }, { key: 'createdAt', label: 'Created' }]} actions={(row) => <ActionButton tone="secondary" onClick={async () => { await apiPatch(`/notifications/${row.id}/read`); await qc.invalidateQueries({ queryKey: ['notifications'] }); }}>Read</ActionButton>} />
    </DashboardShell>
  );
}

function InvestorSection({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return (
    <DashboardShell title="Investor" navItems={investorNav}>
      <PageHeader eyebrow="Investor module" title={title} description={description} icon={icon} />
      {children}
    </DashboardShell>
  );
}

function splitList(value: unknown) {
  return String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

export function InvestmentMemosPage() {
  return <InvestorPipelinePage />;
}
