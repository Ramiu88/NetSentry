import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'netsentry_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then(setUser)
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, logout]);

  async function login(username, password) {
    const { token: newToken } = await api.login(username, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
