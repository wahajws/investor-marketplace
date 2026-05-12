import { DashboardShell } from '../../components/layout/DashboardShell';
import { investorNav } from '../shared/RouteFactory';

export function InvestorDashboardPage() {
  return (
    <DashboardShell
      title="Investor"
      navItems={investorNav}
    >
      <h2 className="text-2xl font-semibold text-slate-950">Investor dashboard</h2>
      <p className="mt-2 text-slate-600">Your investor workspace is protected and ready for Phase 3 organization work.</p>
    </DashboardShell>
  );
}
