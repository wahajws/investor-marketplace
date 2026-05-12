import { JsonResourcePage } from '../../components/data/JsonResourcePage';

export const adminNav = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Organizations', to: '/admin/organizations' },
  { label: 'Startups', to: '/admin/companies' },
  { label: 'AI Review', to: '/admin/ai-runs' },
  { label: 'Matches', to: '/admin/matches' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Audit Logs', to: '/admin/audit-logs' }
];

export const founderNav = [
  { label: 'Dashboard', to: '/founder' },
  { label: 'Profile', to: '/founder/profile' },
  { label: 'Company', to: '/founder/company' },
  { label: 'Team', to: '/founder/company/team' },
  { label: 'Metrics', to: '/founder/company/metrics' },
  { label: 'Fundraising', to: '/founder/company/fundraising' },
  { label: 'Documents', to: '/founder/company/documents' },
  { label: 'AI Feedback', to: '/founder/company/ai-feedback' },
  { label: 'Valuation', to: '/founder/company/valuation' },
  { label: 'Readiness', to: '/founder/company/readiness' },
  { label: 'Matches', to: '/founder/matched-investors' },
  { label: 'Requests', to: '/founder/requests' }
];

export const investorNav = [
  { label: 'Dashboard', to: '/investor' },
  { label: 'Organization', to: '/investor/organization' },
  { label: 'Profile', to: '/investor/profile' },
  { label: 'Preferences', to: '/investor/preferences' },
  { label: 'Discover', to: '/investor/discover' },
  { label: 'Matches', to: '/investor/matched-startups' },
  { label: 'Pipeline', to: '/investor/pipeline' },
  { label: 'Memos', to: '/investor/memos' },
  { label: 'Requests', to: '/investor/requests' }
];

export function AdminResourcePage({ title, endpoint }: { title: string; endpoint: string }) {
  return <JsonResourcePage title={title} navItems={adminNav} endpoint={endpoint} />;
}

export function FounderResourcePage({ title, endpoint, postEndpoint, patchEndpoint, defaultPayload }: { title: string; endpoint: string; postEndpoint?: string; patchEndpoint?: string; defaultPayload?: Record<string, unknown> }) {
  return <JsonResourcePage title={title} navItems={founderNav} endpoint={endpoint} postEndpoint={postEndpoint} patchEndpoint={patchEndpoint} defaultPayload={defaultPayload} />;
}

export function InvestorResourcePage({ title, endpoint, postEndpoint, patchEndpoint, defaultPayload }: { title: string; endpoint: string; postEndpoint?: string; patchEndpoint?: string; defaultPayload?: Record<string, unknown> }) {
  return <JsonResourcePage title={title} navItems={investorNav} endpoint={endpoint} postEndpoint={postEndpoint} patchEndpoint={patchEndpoint} defaultPayload={defaultPayload} />;
}
