import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth.jsx';
import { NavBar } from './components/NavBar.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DeviceDetailPage } from './pages/DeviceDetailPage.jsx';
import { AlertsPage } from './pages/AlertsPage.jsx';
import { ScansPage } from './pages/ScansPage.jsx';

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/devices/:id"
        element={
          <RequireAuth>
            <AppShell>
              <DeviceDetailPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/alerts"
        element={
          <RequireAuth>
            <AppShell>
              <AlertsPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/scans"
        element={
          <RequireAuth>
            <AppShell>
              <ScansPage />
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
