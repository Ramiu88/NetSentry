const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    onUnauthorized();
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: (token) => request('/api/auth/me', { token }),

  listDevices: (token, status) =>
    request(`/api/devices${status ? `?status=${status}` : ''}`, { token }),
  getDevice: (token, id) => request(`/api/devices/${id}`, { token }),
  updateDevice: (token, id, patch) =>
    request(`/api/devices/${id}`, { method: 'PATCH', body: patch, token }),

  listScans: (token) => request('/api/scans', { token }),
  getScan: (token, id) => request(`/api/scans/${id}`, { token }),
  triggerScan: (token, targetCidr) =>
    request('/api/scans', { method: 'POST', body: targetCidr ? { targetCidr } : {}, token }),

  listAlerts: (token, acknowledged) =>
    request(`/api/alerts${acknowledged !== undefined ? `?acknowledged=${acknowledged}` : ''}`, {
      token,
    }),
  acknowledgeAlert: (token, id) =>
    request(`/api/alerts/${id}`, { method: 'PATCH', body: { is_acknowledged: true }, token }),
};
