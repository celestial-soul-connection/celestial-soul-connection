/**
 * authApi.ts — talks to our FastAPI /auth endpoints (signup/login) and stores the
 * JWT in expo-secure-store (encrypted keychain), NOT AsyncStorage.
 *
 * Resilient by design: if the backend is unreachable (common in dev before the
 * API is running), callers can fall back to a local session so onboarding still
 * flows. `signup`/`login` throw a typed AuthError on a real rejection (e.g. wrong
 * password, duplicate email) so the UI can show the message, but surface a
 * distinct `offline` flag when the network simply isn't there.
 */
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';

const TOKEN_KEY = 'csc_access_token';

export interface AuthResult {
  accessToken: string;
  userId: string;
  email: string;
}

export class AuthError extends Error {
  offline: boolean;
  status?: number;
  constructor(message: string, opts: { offline?: boolean; status?: number } = {}) {
    super(message);
    this.name = 'AuthError';
    this.offline = !!opts.offline;
    this.status = opts.status;
  }
}

async function post(path: string, body: unknown): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch {
    throw new AuthError('Can’t reach the server right now.', { offline: true });
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : 'Something went wrong.';
    throw new AuthError(detail, { status: res.status });
  }
  return data;
}

export async function signup(input: { email: string; phone: string; password: string; dob: string }): Promise<AuthResult> {
  const data = await post('/auth/signup', input);
  const result: AuthResult = { accessToken: data.access_token, userId: data.user_id, email: data.email };
  await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
  return result;
}

export async function login(identifier: string, password: string): Promise<AuthResult> {
  const data = await post('/auth/login', { identifier, password });
  const result: AuthResult = { accessToken: data.access_token, userId: data.user_id, email: data.email };
  await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
  return result;
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
