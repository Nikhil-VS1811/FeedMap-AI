import { Building2, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const roles = [
  { value: 'donor', label: 'Donor' },
  { value: 'ngo', label: 'NGO' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'admin', label: 'Admin' },
];

const SignupPage = () => {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      await signup(form);
      navigate('/dashboard', { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">FeedMap AI</p>
          <h1 className="mt-3 text-3xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-2 text-sm text-ink-500">Choose the role that matches how you participate in food recovery.</p>
        </div>

        <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Full name</span>
            <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
              <User size={18} className="text-ink-500" />
              <input
                className="w-full border-0 bg-transparent px-3 py-3 text-sm text-ink-900 outline-none"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Email</span>
            <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
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
            <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
              <Lock size={18} className="text-ink-500" />
              <input
                className="w-full border-0 bg-transparent px-3 py-3 text-sm text-ink-900 outline-none"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">Role</span>
            <div className="mt-1 flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
              <Building2 size={18} className="text-ink-500" />
              <select
                className="w-full border-0 bg-transparent px-3 py-3 text-sm text-ink-900 outline-none"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link className="font-semibold text-primary-700 hover:text-primary-600" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
