import { DashboardShell } from '../../components/layout/DashboardShell';
import { adminNav } from '../shared/RouteFactory';

export function AdminDashboardPage() {
  return (
    <DashboardShell
      title="Admin"
      navItems={adminNav}
    >
      <h2 className="text-2xl font-semibold text-slate-950">Admin dashboard</h2>
      <p className="mt-2 text-slate-600">Phase 2 role-protected admin area is active.</p>
    </DashboardShell>
  );
}
