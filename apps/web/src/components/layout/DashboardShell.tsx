import { LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

type DashboardShellProps = {
  title: string;
  navItems: Array<{ label: string; to: string }>;
  children: ReactNode;
};

export function DashboardShell({ title, navItems, children }: DashboardShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#172033]">
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[#d9d0c2] bg-[#fbfaf6] p-4 lg:max-h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
          <Link to="/" className="block">
            <p className="text-sm font-medium text-[#8b6f2f]">VC Intelligence</p>
            <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
          </Link>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `block shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#172033] text-white shadow-sm' : 'text-slate-600 hover:bg-[#eee5d8] hover:text-slate-950'}`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <header className="flex items-center justify-between border-b border-[#d9d0c2] bg-white/65 px-6 py-4">
            <div>
              <p className="text-sm text-slate-600">{user?.email}</p>
              <p className="text-xs uppercase text-[#8b6f2f]">{user?.roles.join(', ')}</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-[#cfc5b5] bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={16} /> Logout
            </button>
          </header>
          <div className="p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
