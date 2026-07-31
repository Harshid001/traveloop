const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let csrfToken = null;
let fetchPromise = null;

export async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { csrfToken = data.csrfToken; return csrfToken; })
    .catch(() => { csrfToken = null; return null; })
    .finally(() => { fetchPromise = null; });
  return fetchPromise;
}

export function addCsrfHeader(headers) {
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  return headers;
}

ensureCsrfToken();
