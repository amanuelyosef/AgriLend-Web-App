import api, { setTokens, clearTokens } from './client';

export async function login({ email, phone_number, password }) {
  const data = await api('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, phone_number, password },
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function me() {
  return api('/auth/me');
}

export async function updateMe(payload) {
  return api('/auth/me', { method: 'PATCH', body: payload });
}

export async function register(payload) {
  return api('/auth/register', { method: 'POST', auth: false, body: payload });
}

export function logout() {
  clearTokens();
}
