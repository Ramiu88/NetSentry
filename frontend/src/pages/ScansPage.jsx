import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';

const STATUS_STYLES = {
  completed: 'bg-emerald-100 text-emerald-700',
  running: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

export function ScansPage() {
  const { token } = useAuth();
  const [scans, setScans] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = () => api.listScans(token).then(setScans).catch((err) => setError(err.message));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Scan history</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Hosts found</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scans.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-slate-500">{new Date(s.started_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[s.status]}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{s.trigger}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.target_cidr}</td>
                <td className="px-4 py-3 text-slate-900">{s.hosts_found ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
