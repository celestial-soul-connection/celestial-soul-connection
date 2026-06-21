/**
 * session.ts — stubbed auth + onboarding gate. Any phone + any 4-6 digit OTP
 * logs you in (swap requestOtp/verifyOtp for a real provider later). Tracks
 * whether onboarding (the questionnaire) is done so routing can gate it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from './types';

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
}
