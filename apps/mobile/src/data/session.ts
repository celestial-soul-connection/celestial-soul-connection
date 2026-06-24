/**
 * session.ts — auth + onboarding gate, backed by SUPABASE AUTH.
 *
 * Email/password, Google (via id-token), and phone-OTP all go through Supabase;
 * the session (JWT + refresh) is managed by the supabase client. We keep the same
 * exported functions + `Session` shape so screens are unchanged. `onboarded` is
 * tracked in the user's metadata; the `handle_new_user` DB trigger creates the
 * profile row + logs account_core consent on signup.
 */
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Session } from './types';
import { AuthError } from './authApi';
import { GoogleCredential } from './googleAuth';

function fail(message: string): never {
  throw new AuthError(message);
}

function toSession(user: User): Session {
  const provider = user.app_metadata?.provider;
  return {
    userId: user.id,
    email: user.email ?? undefined,
    phone: user.phone ?? '',
    onboarded: !!user.user_metadata?.onboarded,
    provider: provider === 'email' ? 'password' : (provider as Session['provider']),
    createdAt: user.created_at ? Date.parse(user.created_at) : Date.now(),
  };
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ? toSession(data.session.user) : null;
}

/** Email + password signup. Phone & DOB are kept in metadata; the 18+ birth data
 *  is collected/encrypted in onboarding. (Disable "Confirm email" in the Supabase
 *  dashboard for a friction-free dev flow.) */
export async function signUpWithPassword(input: { email: string; phone: string; password: string; dob: string }): Promise<Session> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { phone: input.phone, dob: input.dob, onboarded: false } },
  });
  if (error) fail(error.message);
  const user = data.session?.user ?? data.user;
  if (!user) fail('Account created — confirm your email to continue.');
  return toSession(user);
}

/** Login by email (or phone if no "@"). */
export async function logInWithPassword(identifier: string, password: string): Promise<Session> {
  const id = identifier.trim();
  const creds = id.includes('@') ? { email: id, password } : { phone: id.replace(/[^\d+]/g, ''), password };
  const { data, error } = await supabase.auth.signInWithPassword(creds as any);
  if (error) fail(error.message);
  if (!data.user) fail('Could not sign you in.');
  return toSession(data.user);
}

/** Google: exchange the id-token from the native Google flow for a Supabase
 *  session. Requires the Google provider enabled in the Supabase dashboard. */
export async function signInWithGoogle(cred: GoogleCredential): Promise<Session> {
  if (!cred.idToken) fail('Google did not return an ID token. Try again.');
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: cred.idToken,
    access_token: cred.accessToken,
  });
  if (error) fail(error.message);
  if (!data.user) fail('Google sign-in failed.');
  return toSession(data.user);
}

/** Phone OTP — request the SMS code. */
export async function requestOtp(phone: string): Promise<{ ok: boolean }> {
  const { error } = await supabase.auth.signInWithOtp({ phone: phone.replace(/[^\d+]/g, '') });
  if (error) fail(error.message);
  return { ok: true };
}

/** Phone OTP — verify the SMS code and create the session. */
export async function verifyOtp(phone: string, otp: string): Promise<Session> {
  const { data, error } = await supabase.auth.verifyOtp({ phone: phone.replace(/[^\d+]/g, ''), token: otp, type: 'sms' });
  if (error) fail(error.message);
  if (!data.user) fail('That code did not verify.');
  return toSession(data.user);
}

export async function markOnboarded(): Promise<void> {
  await supabase.auth.updateUser({ data: { onboarded: true } });
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
