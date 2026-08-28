const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'agrilend_access_token';
const REFRESH_KEY = 'agrilend_refresh_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function api(path, { method = 'GET', body, params, auth = true } = {}) {
  const url = new URL(API_BASE + path, window.location.origin);
  if (params) {
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        url.searchParams.set(k, params[k]);
      }
    });
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    clearTokens();
    window.dispatchEvent(new CustomEvent('agrilend:unauthorized'));
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || data.message || detail;
    } catch {
      /* ignore */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export default api;
