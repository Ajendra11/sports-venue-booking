import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Gate for admin-only routes.
 *
 * Signed-out users go to /login; signed-in non-admins get an explicit
 * "not permitted" screen rather than a redirect, so the failure is legible
 * instead of looking like a broken link.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-500" aria-label="Checking your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <main className="page max-w-lg">
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert size={26} aria-hidden="true" />
          </div>
          <h1 className="text-heading text-ink-900">Admin access required</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            Your account doesn't have administrator privileges, so this area is unavailable.
          </p>
          <Link to="/" className="btn-primary mt-6">Back to venues</Link>
        </div>
      </main>
    );
  }

  return children;
}
