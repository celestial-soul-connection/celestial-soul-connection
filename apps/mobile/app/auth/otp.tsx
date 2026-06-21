/**
 * OTP entry — premium segmented code input. Animated progress spine, headline,
 * a "Sent to +91 98765… · Edit" reassurance+escape line, 6 segmented boxes that
 * fill with a spring and shake on a wrong code, and a live resend countdown.
 * Auto-verifies on the last digit (with a deliberate pause). Dev: any code works.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { OnboardingProgress } from '../../src/components/fx/OnboardingProgress';
import { OtpBoxes, OtpBoxesRef } from '../../src/components/fx/OtpBoxes';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { useTheme } from '../../src/theme/ThemeProvider';
import { verifyOtp } from '../../src/data/session';
import { haptic } from '../../src/lib/haptics';

export default function OtpScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const boxesRef = useRef<OtpBoxesRef>(null);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const onComplete = async (code: string) => {
    setVerifying(true);
    try {
      const session = await verifyOtp(phone ?? '', code);
      haptic.success();
      router.replace(session.onboarded ? '/(tabs)/discover' : '/onboarding/birth-portal');
    } catch {
      setVerifying(false);
      boxesRef.current?.shakeError();
    }
  };

  return (
    <CinematicBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: t.spacing.xl, paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing.lg }}>
          <OnboardingProgress step={2} total={4} />

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Reveal index={0}>
              <Text variant="overline" color="primary" uppercase>Step 2 · Almost in</Text>
            </Reveal>
            <Reveal index={1}>
              <Text variant="displayXl" style={{ marginTop: t.spacing.md }}>Enter the code</Text>
            </Reveal>
            <Reveal index={2}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: t.spacing.md }}>
                <Text variant="bodyLg" color="textMuted">Sent to {phone}  </Text>
                <Pressable onPress={() => router.back()} hitSlop={8}>
                  <Text variant="bodyLg" color="primary">Edit</Text>
                </Pressable>
              </View>
            </Reveal>

            <Reveal index={3} style={{ marginTop: t.spacing['2xl'] }}>
              <OtpBoxes ref={boxesRef} length={6} onComplete={onComplete} />
            </Reveal>

            <Reveal index={4} style={{ marginTop: t.spacing.xl, alignItems: 'center' }}>
              {verifying ? (
                <Text variant="label" color="textMuted">Verifying…</Text>
              ) : seconds > 0 ? (
                <Text variant="label" color="textFaint">Resend in 0:{seconds.toString().padStart(2, '0')}</Text>
              ) : (
                <Pressable onPress={() => { setSeconds(30); haptic.light(); }}>
                  <Text variant="label" color="primary">Resend code</Text>
                </Pressable>
              )}
            </Reveal>
          </View>
        </View>
      </KeyboardAvoidingView>
    </CinematicBackground>
  );
}
