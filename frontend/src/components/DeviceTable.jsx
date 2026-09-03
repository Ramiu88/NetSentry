import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export function DeviceTable({ devices }) {
  if (devices.length === 0) {
    return <p className="p-6 text-sm text-slate-500">No devices found yet. Run a scan to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Hostname</th>
            <th className="px-4 py-3">Vendor</th>
            <th className="px-4 py-3">MAC address</th>
            <th className="px-4 py-3">Last seen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {devices.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <StatusBadge device={d} />
              </td>
              <td className="px-4 py-3">
                <Link to={`/devices/${d.id}`} className="font-medium text-slate-900 hover:underline">
                  {d.hostname || 'Unnamed device'}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{d.vendor || '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{d.mac_address}</td>
              <td className="px-4 py-3 text-slate-500">{formatTime(d.last_seen_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
