import { Eye, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">FeedMap AI</p>
            <h1 className="mt-3 text-3xl font-bold text-ink-900">Welcome back</h1>
            <p className="mt-2 text-sm text-ink-500">Sign in to manage donations, requests, routes, and approvals.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Email</span>
              <div className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
                <Mail size={18} className="text-ink-500" />
                <input
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-ink-900 outline-none"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ink-700">Password</span>
              <div className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
                <Lock size={18} className="text-ink-500" />
                <input
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-ink-900 outline-none"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <Eye size={18} className="text-ink-500" />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to FeedMap AI?{' '}
            <Link className="font-semibold text-primary-700 hover:text-primary-600" to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden bg-ink-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">Food rescue intelligence</div>
          <h2 className="mt-8 max-w-lg text-5xl font-bold leading-tight">Move surplus food from intent to impact.</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-2xl font-bold">4</p>
            <p className="mt-1 text-white/70">role workflows</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-2xl font-bold">24/7</p>
            <p className="mt-1 text-white/70">pickup visibility</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4">
            <p className="text-2xl font-bold">AI</p>
            <p className="mt-1 text-white/70">matching layer</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
