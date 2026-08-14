import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader2, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Return the user wherever they were headed before the auth redirect
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="card w-full max-w-md overflow-hidden animate-fade-up">
        <div className="bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-8 text-center text-white">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Trophy size={22} aria-hidden="true" />
          </span>
          <h1 className="text-title">Welcome back</h1>
          <p className="mt-1 text-sm text-brand-100">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <div className="form-error">{error}</div>}

          <div>
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="pt-1 text-center text-sm text-ink-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
