import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';
import { DeviceTable } from '../components/DeviceTable.jsx';

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { token } = useAuth();
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .listDevices(token)
      .then(setDevices)
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  async function runScanNow() {
    setError(null);
    setScanning(true);
    try {
      const scan = await api.triggerScan(token);
      await pollUntilDone(token, scan.id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  }

  const online = devices.filter((d) => d.is_active).length;
  const unreviewed = devices.filter((d) => !d.is_known).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Network dashboard</h1>
        <button
          onClick={runScanNow}
          disabled={scanning}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {scanning ? 'Scanning…' : 'Run scan now'}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatTile label="Total devices" value={devices.length} />
        <StatTile label="Online" value={online} />
        <StatTile label="Unreviewed" value={unreviewed} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <DeviceTable devices={devices} />
      </div>
    </div>
  );
}

async function pollUntilDone(token, scanId, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    const scan = await api.getScan(token, scanId);
    if (scan.status !== 'running') return scan;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}
