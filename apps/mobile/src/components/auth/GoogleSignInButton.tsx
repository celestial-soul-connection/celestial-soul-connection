/**
 * GoogleSignInButton — drop-in "Continue with Google" control for the auth
 * screens. Runs the OAuth flow (useGoogleSignIn), exchanges the credential for
 * our session via session.signInWithGoogle (server-verified), and calls
 * onSession. Surfaces a friendly hint until real client IDs are configured.
 *
 * The Google "G" is the official brand mark (its four brand colours are the one
 * sanctioned exception to the no-raw-colour rule — it's a logo, not UI styling).
 */
import React, { useState } from 'react';
import { Pressable, ActivityIndicator, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { useGoogleSignIn } from '../../data/googleAuth';
import { signInWithGoogle } from '../../data/session';
import { GOOGLE_OAUTH_CONFIGURED } from '../../config';
import { AuthError } from '../../data/authApi';
import { Session } from '../../data/types';
import { haptic } from '../../lib/haptics';

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

export function GoogleSignInButton({
  label = 'Continue with Google',
  onSession,
  onError,
}: {
  label?: string;
  onSession: (s: Session) => void;
  onError?: (message: string) => void;
}) {
  const t = useTheme();
  const [exchanging, setExchanging] = useState(false);

  const { signIn, busy, ready } = useGoogleSignIn({
    onCredential: async (cred) => {
      setExchanging(true);
      try {
        const s = await signInWithGoogle(cred);
        haptic.success();
        onSession(s);
      } catch (e) {
        haptic.error();
        onError?.(e instanceof AuthError ? e.message : 'Google sign-in failed. Try again.');
      } finally {
        setExchanging(false);
      }
    },
    onError: (m) => { haptic.error(); onError?.(m); },
    onCancel: () => {},
  });

  const working = busy || exchanging;

  const press = () => {
    if (!GOOGLE_OAUTH_CONFIGURED) {
      onError?.('Google isn’t configured yet — add your client IDs in src/config.ts (see docs/google-oauth-setup.md).');
      return;
    }
    signIn();
  };

  return (
    <Pressable
      onPress={working ? undefined : press}
      disabled={!ready && GOOGLE_OAUTH_CONFIGURED}
      style={{
        height: 54,
        borderRadius: t.radii.pill,
        backgroundColor: t.colors.bgElevated,
        borderWidth: 1,
        borderColor: t.colors.borderStrong,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.spacing.md,
        opacity: working ? 0.7 : 1,
      }}>
      {working ? <ActivityIndicator color={t.colors.text} /> : <GoogleG />}
      <Text variant="title" color="text">{working ? 'Connecting…' : label}</Text>
    </Pressable>
  );
}

/** A simple "or" divider to sit between password and Google sign-in. */
export function OrDivider() {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
      <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
      <Text variant="overline" color="textFaint" uppercase>or</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
    </View>
  );
}
