const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'traveloop.auth.token';

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token, remember = true) {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  if (!token) return;
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'Traveloop API request failed.');
  }
  return payload.data ?? payload;
}

export const authApi = {
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/users/me'),
  updateMe: (body) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (body) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (body) => apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (body) => apiRequest('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
};

export const tripsApi = {
  list: (params = {}) => apiRequest(`/trips?${new URLSearchParams(params).toString()}`),
  create: (body) => apiRequest('/trips', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiRequest(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => apiRequest(`/trips/${id}`, { method: 'DELETE' }),
};

export const notificationApi = {
  list: () => apiRequest('/notifications'),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  clear: () => apiRequest('/notifications/clear', { method: 'DELETE' }),
};

export { API_BASE_URL, TOKEN_KEY };
