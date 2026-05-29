const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const AUTH_TOKEN_KEY = 'monitoring-auth-token';

export class UnauthorizedError extends Error {
  constructor() {
    super('Authentication required');
  }
}

interface LoginResponse {
  token: string;
  tokenType: string;
  expiresAt: string;
  username: string;
  role: string;
}

export const getAuthToken = () => {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const clearAuthToken = () => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid username or password.');
  }

  const data = await response.json() as LoginResponse;
  window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  return data;
};

export const apiFetch = async (path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    throw new UnauthorizedError();
  }

  return response;
};

export const createMachine = async (name: string) => {
  const response = await apiFetch('/api/v1/machines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to create machine');
  return response.json() as Promise<{ id: string; name: string }>;
};

export const issueToken = async (machineId: string) => {
  const response = await apiFetch(`/api/v1/machines/${machineId}/tokens`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to issue token');
  return response.json() as Promise<{ machineId: string; plainToken: string }>;
};

export const deleteMachine = async (machineId: string) => {
  const response = await apiFetch(`/api/v1/machines/${machineId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete machine');
};

export const killProcess = async (machineId: string, pid: number, processName: string) => {
  const response = await apiFetch(`/api/v1/machines/${machineId}/commands/kill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid, processName }),
  });
  if (!response.ok) throw new Error('Failed to send kill command');
};
