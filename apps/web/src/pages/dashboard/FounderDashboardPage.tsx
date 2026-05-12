import { DashboardShell } from '../../components/layout/DashboardShell';
import { founderNav } from '../shared/RouteFactory';

export function FounderDashboardPage() {
  return (
    <DashboardShell
      title="Founder"
      navItems={founderNav}
    >
      <h2 className="text-2xl font-semibold text-slate-950">Founder dashboard</h2>
      <p className="mt-2 text-slate-600">Your founder workspace is protected and ready for Phase 3 profile work.</p>
    </DashboardShell>
  );
}
