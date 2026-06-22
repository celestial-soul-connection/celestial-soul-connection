/**
 * session.ts — auth + onboarding gate.
 *
 * First-party auth now goes through our FastAPI backend (authApi: email + phone +
 * password, bcrypt-hashed server-side, JWT in expo-secure-store). If the backend
 * is unreachable in dev, signup/login fall back to a local session so onboarding
 * still flows. The legacy phone-OTP stub is kept for the existing OTP screen.
 * Tracks whether onboarding (the questionnaire) is done so routing can gate it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from './types';
import { signup as apiSignup, login as apiLogin, clearToken, AuthError } from './authApi';

const SESSION_KEY = '@csc/session';

export async function getSession(): Promise<Session | null> {
  try {
    const v = await AsyncStorage.getItem(SESSION_KEY);
    return v ? (JSON.parse(v) as Session) : null;
  } catch {
    return null;
  }
}

/** Stub: pretend to send an OTP. Always "succeeds". */
export async function requestOtp(phone: string): Promise<{ ok: boolean }> {
  // Real impl: call provider (Twilio/Firebase). Here we just accept.
  return { ok: phone.replace(/\D/g, '').length >= 7 };
}

/** Stub: accept any non-empty OTP and create/restore a session. */
export async function verifyOtp(phone: string, otp: string): Promise<Session> {
  if (otp.replace(/\D/g, '').length < 4) throw new Error('Enter the code we sent.');
  const existing = await getSession();
  const session: Session =
    existing && existing.phone === phone
      ? existing
      : { phone, userId: 'u_' + phone.replace(/\D/g, ''), onboarded: false, createdAt: Date.now() };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function markOnboarded(): Promise<void> {
  const s = await getSession();
  if (s) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ ...s, onboarded: true }));
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  await clearToken();
}

async function persist(session: Session): Promise<Session> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * First-party signup. Hits the backend; on success the JWT is stored securely by
 * authApi and we keep a local Session for routing. If the server is unreachable
 * (dev), fall back to a local-only session so the flow never dead-ends. A real
 * rejection (duplicate email, weak password, underage) re-throws for the UI.
 */
export async function signUpWithPassword(input: { email: string; phone: string; password: string; dob: string }): Promise<Session> {
  try {
    const res = await apiSignup(input);
    return persist({ phone: input.phone, userId: res.userId, onboarded: false, createdAt: Date.now() });
  } catch (e) {
    if (e instanceof AuthError && e.offline) {
      return persist({ phone: input.phone, userId: 'local_' + Date.now(), onboarded: false, createdAt: Date.now() });
    }
    throw e;
  }
}

/** First-party login by email OR phone. Same offline fallback as signup. */
export async function logInWithPassword(identifier: string, password: string): Promise<Session> {
  try {
    const res = await apiLogin(identifier, password);
    const existing = await getSession();
    return persist(existing ?? { phone: identifier, userId: res.userId, onboarded: false, createdAt: Date.now() });
  } catch (e) {
    if (e instanceof AuthError && e.offline) {
      const existing = await getSession();
      if (existing) return existing;
      return persist({ phone: identifier, userId: 'local_' + Date.now(), onboarded: false, createdAt: Date.now() });
    }
    throw e;
  }
}
