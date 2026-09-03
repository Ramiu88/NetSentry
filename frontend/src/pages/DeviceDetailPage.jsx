import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function DeviceDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api
      .getDevice(token, id)
      .then(setDevice)
      .catch((err) => setError(err.message));
  }, [token, id]);

  useEffect(load, [load]);

  async function allowlist() {
    setSaving(true);
    try {
      await api.updateDevice(token, id, { is_known: true });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;
  if (!device) return <div className="p-6 text-sm text-slate-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link to="/" className="text-sm text-slate-500 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {device.hostname || 'Unnamed device'}
            </h1>
            <p className="mt-1 font-mono text-sm text-slate-500">{device.mac_address}</p>
          </div>
          <StatusBadge device={device} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">Vendor</dt>
            <dd className="text-slate-900">{device.vendor || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-400">First seen</dt>
            <dd className="text-slate-900">{new Date(device.first_seen_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Last seen</dt>
            <dd className="text-slate-900">{new Date(device.last_seen_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Reviewed / allowlisted</dt>
            <dd className="text-slate-900">{device.is_known ? 'Yes' : 'No'}</dd>
          </div>
        </dl>

        {!device.is_known && (
          <button
            onClick={allowlist}
            disabled={saving}
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Mark as known / allowlist'}
          </button>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
          Sighting history
        </h2>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2">Seen at</th>
              <th className="px-4 py-2">IP address</th>
              <th className="px-4 py-2">Open ports</th>
              <th className="px-4 py-2">Scan type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {device.sightings.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-slate-500">{new Date(s.seen_at).toLocaleString()}</td>
                <td className="px-4 py-2 font-mono text-xs">{s.ip_address}</td>
                <td className="px-4 py-2 text-slate-600">
                  {(s.open_ports || []).map((p) => `${p.port}/${p.proto}`).join(', ') || '—'}
                </td>
                <td className="px-4 py-2 text-slate-500">{s.scan_trigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
