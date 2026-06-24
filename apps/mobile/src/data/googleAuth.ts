/**
 * googleAuth.ts — native Google Sign-In (@react-native-google-signin), the
 * Supabase-recommended path for reliable id-tokens on Android/iOS. Returns a
 * `GoogleCredential` (id-token) that session.signInWithGoogle exchanges for a
 * Supabase session via supabase.auth.signInWithIdToken.
 *
 * The native module is NOT available in Expo Go — it needs a development build.
 * We lazy-require it and detect Expo Go so the button degrades to a clear hint
 * instead of crashing. (Email/password works everywhere, incl. Expo Go.)
 */
import { useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import { GOOGLE_OAUTH } from '../config';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Lazy, crash-safe load of the native module (absent in Expo Go).
let GS: any = null;
let isSuccessResponse: (r: any) => boolean = () => false;
let statusCodes: any = {};
if (!isExpoGo) {
  try {
    const m = require('@react-native-google-signin/google-signin');
    GS = m.GoogleSignin;
    isSuccessResponse = m.isSuccessResponse ?? (() => false);
    statusCodes = m.statusCodes ?? {};
  } catch {
    GS = null;
  }
}

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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!GS) return;
    try {
      GS.configure({
        webClientId: GOOGLE_OAUTH.webClientId, // required to receive an idToken
        iosClientId: GOOGLE_OAUTH.iosClientId || undefined,
        offlineAccess: false,
      });
    } catch {
      /* configure is safe to retry on next sign-in */
    }
  }, []);

  const signIn = async () => {
    if (!GS) {
      hRef.current.onError('Google sign-in needs a development build (not Expo Go). Use email for now.');
      return;
    }
    setBusy(true);
    try {
      await GS.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const res = await GS.signIn();
      if (isSuccessResponse(res)) {
        const idToken: string | undefined = res.data?.idToken ?? undefined;
        const user = res.data?.user;
        if (!idToken) {
          hRef.current.onError('Google did not return an ID token. Try again.');
          return;
        }
        hRef.current.onCredential({ idToken, email: user?.email, name: user?.name, photo: user?.photo ?? undefined });
      } else {
        hRef.current.onCancel?.(); // user dismissed
      }
    } catch (e: any) {
      if (e?.code && statusCodes && e.code === statusCodes.SIGN_IN_CANCELLED) hRef.current.onCancel?.();
      else hRef.current.onError(e?.message ?? 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return { signIn, busy, ready: !!GS };
}
