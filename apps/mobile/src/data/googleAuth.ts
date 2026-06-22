/**
 * googleAuth.ts — runs the Google OAuth flow on the device (expo-auth-session)
 * and hands back the resulting credential (id_token / access_token) plus a
 * best-effort profile for immediate UI. The credential is NOT trusted here — it
 * is sent to our backend (/auth/google) which verifies it and issues our JWT.
 *
 * Works in Expo Go for the modules themselves; the LIVE Google consent screen
 * needs the redirect URIs registered + ideally a dev build (see
 * docs/google-oauth-setup.md). Client IDs come from config (GOOGLE_OAUTH).
 */
import { useEffect, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_OAUTH } from '../config';

// Finalises the auth session if the app was opened via the OAuth redirect.
WebBrowser.maybeCompleteAuthSession();

export interface GoogleCredential {
  idToken?: string;
  accessToken?: string;
  email?: string;
  name?: string;
  photo?: string;
}

interface Handlers {
  onCredential: (c: GoogleCredential) => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

export function useGoogleSignIn(handlers: Handlers) {
  const hRef = useRef(handlers);
  hRef.current = handlers;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_OAUTH.webClientId,
    iosClientId: GOOGLE_OAUTH.iosClientId,
    androidClientId: GOOGLE_OAUTH.androidClientId,
    scopes: ['openid', 'profile', 'email'],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!response) return;
    (async () => {
      try {
        if (response.type === 'success') {
          const auth = response.authentication;
          const idToken = auth?.idToken ?? undefined;
          const accessToken = auth?.accessToken ?? undefined;
          if (!idToken && !accessToken) {
            hRef.current.onError('Google did not return a token. Try again.');
            return;
          }
          // Best-effort profile for instant UI; the server is the source of truth.
          let profile: any = {};
          if (accessToken) {
            try {
              const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              profile = await r.json();
            } catch {
              /* non-fatal */
            }
          }
          hRef.current.onCredential({ idToken, accessToken, email: profile.email, name: profile.name, photo: profile.picture });
        } else if (response.type === 'error') {
          hRef.current.onError(response.error?.message ?? 'Google sign-in failed.');
        } else if (response.type === 'cancel' || response.type === 'dismiss') {
          hRef.current.onCancel?.();
        }
      } finally {
        setBusy(false);
      }
    })();
  }, [response]);

  const signIn = async () => {
    setBusy(true);
    try {
      await promptAsync();
    } catch {
      hRef.current.onError('Could not open Google sign-in.');
      setBusy(false);
    }
  };

  return { signIn, busy, ready: !!request };
}
