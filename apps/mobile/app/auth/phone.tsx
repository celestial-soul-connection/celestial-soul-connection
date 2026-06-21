/**
 * Phone entry — premium, Hinge-grade. Full-bleed (not boxed): animated progress
 * spine, oversized conversational headline, warm trust microcopy, a country-pill +
 * big dialing-digits input with a center-grow focus underline, and a bottom-
 * anchored CTA that "unlocks" (lifts to filled accent) the moment the number is valid.
 */
import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { OnboardingProgress } from '../../src/components/fx/OnboardingProgress';
import { PhoneField, COUNTRIES, Country } from '../../src/components/fx/PhoneField';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/ThemeProvider';
import { requestOtp } from '../../src/data/session';

export default function PhoneScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);

  const fullNumber = `${country.dial} ${phone}`.trim();
  const valid = phone.replace(/\D/g, '').length >= 7;

  const submit = async () => {
    setLoading(true);
    const { ok } = await requestOtp(fullNumber);
    setLoading(false);
    if (ok) router.push({ pathname: '/auth/otp', params: { phone: fullNumber } });
  };

  return (
    <CinematicBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: t.spacing.xl, paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing.lg }}>
          <OnboardingProgress step={1} total={4} />

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Reveal index={0}>
              <Text variant="overline" color="primary" uppercase>Step 1 · Verify it's you</Text>
            </Reveal>
            <Reveal index={1}>
              <Text variant="displayXl" style={{ marginTop: t.spacing.md }}>What's your{'\n'}number?</Text>
            </Reveal>
            <Reveal index={2}>
              <Text variant="bodyLg" color="textMuted" style={{ marginTop: t.spacing.md }}>
                We'll text a quick code to confirm it's really you. Your number stays private —
                never shown to anyone, never spammed.
              </Text>
            </Reveal>

            <Reveal index={3} style={{ marginTop: t.spacing['2xl'] }}>
              <PhoneField value={phone} onChangeText={setPhone} country={country} onCountryChange={setCountry} />
            </Reveal>
          </View>

          <Reveal index={4}>
            <Button label="Send my code" disabled={!valid} loading={loading} onPress={submit} />
            <Text variant="caption" color="textFaint" center style={{ marginTop: t.spacing.md }}>
              Dev mode — any number, then any code.
            </Text>
          </Reveal>
        </View>
      </KeyboardAvoidingView>
    </CinematicBackground>
  );
}
