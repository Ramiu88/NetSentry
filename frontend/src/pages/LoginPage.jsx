import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">NetSentry</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in to the IT dashboard.</p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
