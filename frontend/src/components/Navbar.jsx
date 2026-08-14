import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, CalendarCheck, Trophy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-800/40 bg-brand-700 shadow-sm">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 text-white" onClick={() => setIsMenuOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Trophy size={19} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight">Sports Booking</span>
              <span className="block text-[11px] text-brand-200">Find & reserve a court</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>Venues</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={linkClass}>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={15} aria-hidden="true" />
                      Admin
                    </span>
                  </NavLink>
                )}
                <div className="ml-2 flex items-center gap-2 border-l border-white/20 pl-3">
                  <span className="hidden text-xs text-brand-200 lg:inline">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-brand-100 transition-colors hover:bg-red-500/25 hover:text-white"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <NavLink to="/login" className={linkClass}>Login</NavLink>
                <Link to="/register" className="btn btn-sm bg-white text-brand-700 hover:bg-brand-50">
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10 md:hidden"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="border-t border-white/10 bg-brand-700 px-4 pb-4 pt-2 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end className={linkClass} onClick={() => setIsMenuOpen(false)}>Venues</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/my-bookings" className={linkClass} onClick={() => setIsMenuOpen(false)}>
                  <span className="flex items-center gap-2"><CalendarCheck size={15} /> My Bookings</span>
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={linkClass} onClick={() => setIsMenuOpen(false)}>
                    <span className="flex items-center gap-2"><ShieldCheck size={15} /> Admin panel</span>
                  </NavLink>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="px-3 text-xs text-brand-200">Signed in as {user?.name}</span>
                  <button onClick={handleLogout} className="btn btn-sm bg-white/15 text-white hover:bg-white/25">
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-2 flex gap-2 border-t border-white/15 pt-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-sm flex-1 bg-white/15 text-white hover:bg-white/25">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn btn-sm flex-1 bg-white text-brand-700 hover:bg-brand-50">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
