import { DashboardShell } from '../../components/layout/DashboardShell';

export function SecurityPage() {
  return (
    <DashboardShell title="Security" navItems={[{ label: 'Account', to: '/account' }, { label: 'Security', to: '/account/security' }]}>
      <h2 className="text-2xl font-semibold text-slate-950">Security</h2>
      <p className="mt-2 text-slate-600">Password change API is available; the full form will be expanded in the account settings phase.</p>
    </DashboardShell>
  );
}
