import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';
import { AlertList } from '../components/AlertList.jsx';

export function AlertsPage() {
  const { token } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .listAlerts(token, showAll ? undefined : false)
      .then(setAlerts)
      .catch((err) => setError(err.message));
  }, [token, showAll]);

  useEffect(load, [load]);

  async function acknowledge(id) {
    try {
      await api.acknowledgeAlert(token, id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Alerts</h1>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show acknowledged
        </label>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="rounded-xl border border-slate-200 bg-white">
        <AlertList alerts={alerts} onAcknowledge={acknowledge} />
      </div>
    </div>
  );
}
