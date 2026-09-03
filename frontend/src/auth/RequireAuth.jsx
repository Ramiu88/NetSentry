import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export function RequireAuth({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading…</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
