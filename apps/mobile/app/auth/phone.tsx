/**
 * Phone entry — first step of the stubbed OTP login. Enter any phone; we "send"
 * a code and move to the OTP screen. Premium glass input over the cinematic bg.
 */
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { useTheme } from '../../src/theme/ThemeProvider';
import { requestOtp } from '../../src/data/session';

export default function PhoneScreen() {
  const t = useTheme();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { ok } = await requestOtp(phone);
    setLoading(false);
    if (ok) router.push({ pathname: '/auth/otp', params: { phone } });
  };

  const valid = phone.replace(/\D/g, '').length >= 7;

  return (
    <ScreenFrame scroll={false} contentStyle={{ flex: 1, justifyContent: 'center' }}>
      <Text variant="overline" color="textFaint" uppercase>Welcome</Text>
      <Text variant="displayLg" style={{ marginTop: t.spacing.xs }}>Let's begin with your number</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        We use it to keep the community real and verified. It's never shown to other
        members.
      </Text>

      <GlassCard style={{ marginTop: t.spacing.xl }}>
        <Text variant="overline" color="textFaint" uppercase>Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+91 98765 43210"
          placeholderTextColor={t.colors.textFaint}
          autoFocus
          style={{ color: t.colors.text, fontFamily: t.fontFamily.bodyBold, fontSize: 22, marginTop: t.spacing.sm, paddingVertical: t.spacing.sm }}
        />
      </GlassCard>

      <Button label="Send me a code" disabled={!valid} loading={loading} onPress={submit} style={{ marginTop: t.spacing.xl }} />
      <Text variant="caption" color="textFaint" center style={{ marginTop: t.spacing.md }}>
        Dev mode: enter any number, then any code.
      </Text>
    </ScreenFrame>
  );
}
