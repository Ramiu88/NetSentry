import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api/client.js';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function NavBar() {
  const { token, user, logout } = useAuth();
  const [unackCount, setUnackCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const poll = () =>
      api
        .listAlerts(token, false)
        .then((alerts) => !cancelled && setUnackCount(alerts.length))
        .catch(() => {});
    poll();
    const interval = setInterval(poll, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold text-slate-900">NetSentry</span>
        <div className="flex gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/alerts" className={linkClass}>
            Alerts
            {unackCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {unackCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/scans" className={linkClass}>
            Scans
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        {user && <span>{user.username}</span>}
        <button onClick={logout} className="rounded-md px-3 py-1.5 hover:bg-slate-100">
          Log out
        </button>
      </div>
    </nav>
  );
}
