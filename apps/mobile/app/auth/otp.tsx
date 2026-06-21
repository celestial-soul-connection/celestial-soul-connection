/**
 * OTP entry — second step. Any 4-6 digit code verifies (stub). On success we
 * route to the questionnaire if not onboarded, else straight to matches.
 */
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { useTheme } from '../../src/theme/ThemeProvider';
import { verifyOtp } from '../../src/data/session';
import { haptic } from '../../src/lib/haptics';

export default function OtpScreen() {
  const t = useTheme();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const session = await verifyOtp(phone ?? '', otp);
      haptic.success();
      router.replace(session.onboarded ? '/match/daily' : '/onboarding/birth-portal');
    } catch (e: any) {
      setError(e.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const valid = otp.replace(/\D/g, '').length >= 4;

  return (
    <ScreenFrame scroll={false} contentStyle={{ flex: 1, justifyContent: 'center' }}>
      <Text variant="overline" color="textFaint" uppercase>Verify</Text>
      <Text variant="displayLg" style={{ marginTop: t.spacing.xs }}>Enter your code</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        We sent a 6-digit code to {phone}. (Dev mode: any code works.)
      </Text>

      <GlassCard style={{ marginTop: t.spacing.xl }}>
        <TextInput
          value={otp}
          onChangeText={(v) => { setOtp(v); setError(null); }}
          keyboardType="number-pad"
          placeholder="• • • • • •"
          placeholderTextColor={t.colors.textFaint}
          autoFocus
          maxLength={6}
          style={{ color: t.colors.text, fontFamily: t.fontFamily.bodyBold, fontSize: 30, letterSpacing: 10, textAlign: 'center', paddingVertical: t.spacing.sm }}
        />
      </GlassCard>
      {error && <Text variant="caption" color="danger" center style={{ marginTop: t.spacing.sm }}>{error}</Text>}

      <Button label="Verify & continue" disabled={!valid} loading={loading} onPress={submit} style={{ marginTop: t.spacing.xl }} />
    </ScreenFrame>
  );
}
