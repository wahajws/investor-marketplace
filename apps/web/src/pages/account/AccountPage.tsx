import { DashboardShell } from '../../components/layout/DashboardShell';
import { useAuth } from '../../features/auth/AuthContext';

export function AccountPage() {
  const { user } = useAuth();

  return (
    <DashboardShell title="Account" navItems={[{ label: 'Account', to: '/account' }, { label: 'Security', to: '/account/security' }]}>
      <h2 className="text-2xl font-semibold text-slate-950">Account</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-slate-500">Email</dt>
          <dd className="text-slate-900">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Roles</dt>
          <dd className="text-slate-900">{user?.roles.join(', ')}</dd>
        </div>
      </dl>
    </DashboardShell>
  );
}
