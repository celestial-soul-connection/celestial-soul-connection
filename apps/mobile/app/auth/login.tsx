/**
 * Log in — first-party: email OR phone + password. Container-light to the design
 * bar. Submits via session.logInWithPassword (JWT in secure store); on success
 * routes into the app. Offline-tolerant in dev.
 */
import React, { useState } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { GoogleSignInButton, OrDivider } from '../../src/components/auth/GoogleSignInButton';
import { useTheme } from '../../src/theme/ThemeProvider';
import { logInWithPassword } from '../../src/data/session';
import { AuthError } from '../../src/data/authApi';
import { Session } from '../../src/data/types';
import { haptic } from '../../src/lib/haptics';

export default function LogIn() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = identifier.trim().length >= 3 && password.length >= 1 && !loading;

  const goAfterAuth = (s: Session) =>
    router.replace(s.onboarded ? '/(tabs)/today' : '/onboarding/birth-portal');

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const s = await logInWithPassword(identifier.trim(), password);
      haptic.success();
      goAfterAuth(s);
    } catch (e) {
      haptic.error();
      setError(e instanceof AuthError ? e.message : 'Could not log you in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CinematicBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: t.spacing.xl, paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing.lg }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text variant="headline" color="textMuted">‹</Text>
          </Pressable>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Reveal index={0}>
              <Text variant="overline" color="primary" uppercase>Welcome back</Text>
            </Reveal>
            <Reveal index={1}>
              <Text variant="displayXl" style={{ marginTop: t.spacing.md }}>Log in.</Text>
            </Reveal>

            <Reveal index={2} style={{ marginTop: t.spacing['2xl'], gap: t.spacing.lg }}>
              <View>
                <Text variant="overline" color="textFaint" uppercase>Email or phone</Text>
                <TextInput
                  value={identifier} onChangeText={setIdentifier} placeholder="you@example.com or +91…"
                  placeholderTextColor={t.colors.textFaint} autoCapitalize="none" autoComplete="username"
                  style={{ color: t.colors.text, fontFamily: t.fontFamily.bodyMedium, fontSize: 18, paddingVertical: t.spacing.sm }}
                />
                <View style={{ height: 1, backgroundColor: t.colors.border }} />
              </View>
              <View>
                <Text variant="overline" color="textFaint" uppercase>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={password} onChangeText={setPassword} placeholder="Your password"
                    placeholderTextColor={t.colors.textFaint} secureTextEntry={!show} autoCapitalize="none"
                    onSubmitEditing={submit} returnKeyType="go"
                    style={{ flex: 1, color: t.colors.text, fontFamily: t.fontFamily.bodyMedium, fontSize: 18, paddingVertical: t.spacing.sm }}
                  />
                  <Pressable onPress={() => setShow((s) => !s)} hitSlop={10}>
                    <Text variant="label" color="textMuted">{show ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>
                <View style={{ height: 1, backgroundColor: t.colors.border }} />
              </View>
            </Reveal>

            {error && (
              <Reveal index={3}>
                <Text variant="caption" color="danger" style={{ marginTop: t.spacing.lg }}>{error}</Text>
              </Reveal>
            )}
          </View>

          <Reveal index={4} style={{ gap: t.spacing.lg }}>
            <Button label="Log in" disabled={!canSubmit} loading={loading} onPress={submit} />
            <OrDivider />
            <GoogleSignInButton onSession={goAfterAuth} onError={setError} />
            <Pressable onPress={() => router.replace('/auth/signup')} style={{ alignSelf: 'center', paddingVertical: t.spacing.sm }}>
              <Text variant="label" color="textMuted">New here? <Text variant="label" color="primary">Create an account</Text></Text>
            </Pressable>
          </Reveal>
        </View>
      </KeyboardAvoidingView>
    </CinematicBackground>
  );
}
