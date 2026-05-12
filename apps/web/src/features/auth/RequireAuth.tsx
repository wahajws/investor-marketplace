import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '../../lib/auth-types';
import { useAuth } from './AuthContext';

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#f6f1e8] text-slate-600">Loading session...</div>;
  }

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  if (roles?.length && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate replace to={getDefaultDashboard(user.roles)} />;
  }

  return <Outlet />;
}

export function getDefaultDashboard(roles: UserRole[]) {
  if (roles.includes('ADMIN')) return '/admin';
  if (roles.includes('INVESTOR')) return '/investor';
  return '/founder';
}
