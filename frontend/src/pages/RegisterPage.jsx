import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, UserPlus, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getSignupConfig } from '../api/authApi.js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCodeEnabled, setAdminCodeEnabled] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Only offer the field if this server actually accepts a code
  useEffect(() => {
    getSignupConfig().then((c) => setAdminCodeEnabled(c.adminCodeEnabled));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password, phone || undefined, adminCode.trim() || undefined);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="card w-full max-w-md overflow-hidden animate-fade-up">
        <div className="bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-8 text-center text-white">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <UserPlus size={22} aria-hidden="true" />
          </span>
          <h1 className="text-title">Create account</h1>
          <p className="mt-1 text-sm text-brand-100">Join us to book sports venues</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <div className="form-error">{error}</div>}

          <div>
            <label htmlFor="reg-name" className="form-label">Full name *</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="form-label">Email *</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-phone" className="form-label">Phone (optional)</label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+977 98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-password" className="form-label">Password *</label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="form-label">Confirm *</label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Admin signup code — collapsed by default so it stays out of the
              way for the 99% of people registering as regular users. */}
          {adminCodeEnabled && (
            <div className="rounded-xl border border-ink-200 bg-ink-50/60">
              <button
                type="button"
                onClick={() => setShowAdminCode((open) => !open)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
                aria-expanded={showAdminCode}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-ink-400" aria-hidden="true" />
                  Have an admin code?
                </span>
                <ChevronDown
                  size={16}
                  className={`text-ink-400 transition-transform duration-200 ${showAdminCode ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {showAdminCode && (
                <div className="border-t border-ink-200 px-4 py-3 animate-fade-in">
                  <label htmlFor="reg-admin-code" className="form-label">Admin code</label>
                  <input
                    id="reg-admin-code"
                    type="password"
                    autoComplete="off"
                    placeholder="Leave blank to register as a normal user"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="form-input"
                  />
                  <p className="mt-2 text-xs text-ink-500">
                    Creates this account with administrator access. Ask whoever runs
                    this deployment for the code.
                  </p>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {isSubmitting
              ? 'Creating account…'
              : adminCode.trim()
                ? 'Create admin account'
                : 'Create account'}
          </button>

          <p className="pt-1 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
