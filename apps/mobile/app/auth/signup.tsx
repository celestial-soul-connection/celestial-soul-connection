/**
 * Sign up — first-party account: email + phone + password (+ DOB for the 18+ gate).
 *
 * Container-light to the design bar: animated progress spine, oversized headline,
 * clean underlined fields (no boxed form). Submits to the FastAPI backend via
 * session.signUpWithPassword (bcrypt-hashed server-side, JWT in secure store);
 * falls back to a local session if the API is unreachable in dev. On success →
 * birth portal (onboarding continues).
 */
import React, { useState } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { OnboardingProgress } from '../../src/components/fx/OnboardingProgress';
import { DateTimeField } from '../../src/components/fx/DateTimeField';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { GoogleSignInButton, OrDivider } from '../../src/components/auth/GoogleSignInButton';
import { useTheme } from '../../src/theme/ThemeProvider';
import { signUpWithPassword } from '../../src/data/session';
import { AuthError } from '../../src/data/authApi';
import { Session } from '../../src/data/types';
import { haptic } from '../../src/lib/haptics';

const eighteenYearsAgo = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; })();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = EMAIL_RE.test(email.trim());
  const phoneOk = phone.replace(/\D/g, '').length >= 7;
  const passOk = password.length >= 8;
  const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const canSubmit = emailOk && phoneOk && passOk && dobOk && !loading;

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      await signUpWithPassword({ email: email.trim(), phone: phone.trim(), password, dob });
      haptic.success();
      router.replace('/onboarding/birth-portal');
    } catch (e) {
      haptic.error();
      setError(e instanceof AuthError ? e.message : 'Could not create your account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CinematicBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: t.spacing.xl, paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing.lg }}>
          <OnboardingProgress step={1} total={4} />

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: t.spacing.xl }}>
            <Reveal index={0}>
              <Text variant="overline" color="primary" uppercase>Step 1 · Create your account</Text>
            </Reveal>
            <Reveal index={1}>
              <Text variant="displayXl" style={{ marginTop: t.spacing.md }}>Begin your{'\n'}alignment.</Text>
            </Reveal>
            <Reveal index={2}>
              <Text variant="bodyLg" color="textMuted" style={{ marginTop: t.spacing.md }}>
                Your details are encrypted and private. We never sell your data or show your
                contact to anyone.
              </Text>
            </Reveal>

            <Reveal index={3} style={{ marginTop: t.spacing['2xl'], gap: t.spacing.lg }}>
              <Field t={t} label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com"
                keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Field t={t} label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 98xxxxxxxx"
                keyboardType="phone-pad" autoComplete="tel" />
              <View>
                <Text variant="overline" color="textFaint" uppercase>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={password} onChangeText={setPassword} placeholder="At least 8 characters"
                    placeholderTextColor={t.colors.textFaint} secureTextEntry={!show} autoCapitalize="none"
                    style={{ flex: 1, color: t.colors.text, fontFamily: t.fontFamily.bodyMedium, fontSize: 18, paddingVertical: t.spacing.sm }}
                  />
                  <Pressable onPress={() => setShow((s) => !s)} hitSlop={10}>
                    <Text variant="label" color="textMuted">{show ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>
                <View style={{ height: 1, backgroundColor: t.colors.border }} />
              </View>
              <DateTimeField mode="date" label="Date of birth (18+)" value={dob} maximumDate={eighteenYearsAgo} onChange={setDob} />
            </Reveal>

            {error && (
              <Reveal index={4}>
                <Text variant="caption" color="danger" style={{ marginTop: t.spacing.lg }}>{error}</Text>
              </Reveal>
            )}
          </View>

          <Reveal index={5} style={{ gap: t.spacing.lg }}>
            <Button label="Create account" disabled={!canSubmit} loading={loading} onPress={submit} />
            <OrDivider />
            <GoogleSignInButton
              label="Sign up with Google"
              onSession={(s: Session) => router.replace(s.onboarded ? '/(tabs)/today' : '/onboarding/birth-portal')}
              onError={setError}
            />
            <Pressable onPress={() => router.push('/auth/login')} style={{ alignSelf: 'center', paddingVertical: t.spacing.sm }}>
              <Text variant="label" color="textMuted">Already have an account? <Text variant="label" color="primary">Log in</Text></Text>
            </Pressable>
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </CinematicBackground>
  );
}

function Field({ t, label, ...input }: { t: ReturnType<typeof useTheme>; label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <Text variant="overline" color="textFaint" uppercase>{label}</Text>
      <TextInput
        {...input}
        placeholderTextColor={t.colors.textFaint}
        style={{ color: t.colors.text, fontFamily: t.fontFamily.bodyMedium, fontSize: 18, paddingVertical: t.spacing.sm }}
      />
      <View style={{ height: 1, backgroundColor: t.colors.border }} />
    </View>
  );
}
