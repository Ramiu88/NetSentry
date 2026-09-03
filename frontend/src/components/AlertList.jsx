import { Link } from 'react-router-dom';

function formatTime(iso) {
  return new Date(iso).toLocaleString();
}

export function AlertList({ alerts, onAcknowledge }) {
  if (alerts.length === 0) {
    return <p className="p-6 text-sm text-slate-500">No alerts.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {alerts.map((a) => (
        <li key={a.id} className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="font-medium text-slate-900">{a.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              <Link to={`/devices/${a.device_id}`} className="hover:underline">
                {a.hostname || a.vendor || a.mac_address}
              </Link>{' '}
              · {formatTime(a.created_at)}
            </p>
          </div>
          {!a.is_acknowledged && (
            <button
              onClick={() => onAcknowledge(a.id)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Acknowledge
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
