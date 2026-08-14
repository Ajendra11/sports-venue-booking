import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarRange, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const TABS = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/venues', label: 'Venues', icon: Building2 },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <main className="page">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-title text-ink-900">
              <ShieldCheck size={22} className="text-brand-600" aria-hidden="true" />
              Admin panel
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Signed in as {user?.name} · manage venues, bookings and platform analytics
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-ink-200 pb-px" aria-label="Admin sections">
          {TABS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800'
                }`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </main>
  );
}
