import { ensureCsrfToken, addCsrfHeader } from './csrf';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  if (mutatingMethods.has(method)) {
    await ensureCsrfToken();
    addCsrfHeader(headers);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
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
  resetPassword: (token, body) => apiRequest(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (body) => apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (body) => apiRequest('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
};

export { API_BASE_URL };
