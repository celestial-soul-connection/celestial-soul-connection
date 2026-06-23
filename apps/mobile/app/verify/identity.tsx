/**
 * Identity Verification — India, DigiLocker-style (provider-agnostic UX).
 *
 * The strongest trust signal for marriage-minded users. A calm, three-beat flow:
 *   1. Why & how we protect it — plain-language notice + explicit kyc_verification
 *      consent (DPDP-compliant; we store ONLY pass/fail, never your documents).
 *   2. Provider handoff — DigiLocker (Aadhaar/PAN/DL), simulated here.
 *   3. Verified — status saved; appears as a badge only, never the document.
 *
 * Real DigiLocker/KYC-vendor integration slots into `runProvider()` later; the
 * screen and consent ledger don't change. No raw ID data is ever stored.
 */
import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SkyScreen } from '../../src/components/SkyScreen';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Reveal } from '../../src/components/fx/Reveal';
import { SoulMerge } from '../../src/components/fx/SoulMerge';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/ThemeProvider';
import { completeIdVerification } from '../../src/data/store';
import { haptic } from '../../src/lib/haptics';

type Step = 'intro' | 'provider' | 'running' | 'done';

const PROVIDERS = [
  { key: 'digilocker', label: 'DigiLocker', help: 'Government-backed · Aadhaar, PAN or Driving Licence', glyph: '🪪' },
  { key: 'pan', label: 'PAN card', help: 'Verify with your PAN', glyph: '💳' },
];

export default function IdentityVerification() {
  const t = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [consent, setConsent] = useState(false);

  // Stub for the real provider handshake. Returns only pass/fail in production.
  const runProvider = async (method: string) => {
    setStep('running');
    await new Promise((r) => setTimeout(r, 1800));
    await completeIdVerification(method); // logs kyc_verification consent + sets status
    haptic.success();
    setStep('done');
  };

  return (
    <SkyScreen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.xs }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Text variant="headline" color="textMuted">‹</Text></Pressable>
        <Text variant="overline" color="textFaint" uppercase>Trust · Identity</Text>
      </View>

      {step === 'intro' && (
        <Reveal index={0}>
          <Text variant="displayLg">Verify you’re real</Text>
          <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm, lineHeight: 22 }}>
            A verified identity is the strongest signal of a genuine, serious soul — and the
            single biggest thing that makes others feel safe to meet you.
          </Text>

          <GlassCard style={{ marginTop: t.spacing.lg }}>
            <Text variant="title">How we protect you</Text>
            {[
              ['☾', 'We store only your verified status — never your Aadhaar, PAN, or any document.'],
              ['✦', 'Verification happens with a government-backed provider (DigiLocker). Your documents never touch our servers.'],
              ['⚖', 'Used only to confirm you’re a real, 18+ person. You can withdraw consent and delete this anytime in Settings.'],
            ].map(([g, line]) => (
              <View key={line} style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.md }}>
                <Text variant="title" color="highlight" style={{ width: 20, textAlign: 'center' }}>{g}</Text>
                <Text variant="body" color="textMuted" style={{ flex: 1, lineHeight: 21 }}>{line}</Text>
              </View>
            ))}
          </GlassCard>

          {/* Explicit, unbundled kyc_verification consent */}
          <Pressable onPress={() => setConsent((c) => !c)} style={{ flexDirection: 'row', gap: t.spacing.md, alignItems: 'flex-start', marginTop: t.spacing.lg }}>
            <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: consent ? t.colors.primary : t.colors.borderStrong, backgroundColor: consent ? t.colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              {consent && <Text variant="caption" color="textOnPrimary">✓</Text>}
            </View>
            <Text variant="body" color="textMuted" style={{ flex: 1, lineHeight: 21 }}>
              I consent to verify my identity for the purpose of trust &amp; safety
              (purpose: <Text variant="body" color="text">kyc_verification</Text>). I understand only my
              verified status is kept, and I can withdraw this anytime.
            </Text>
          </Pressable>

          <Button label="Continue to verification" disabled={!consent} onPress={() => { haptic.light(); setStep('provider'); }} style={{ marginTop: t.spacing.xl }} />
          <Text variant="caption" color="textFaint" center style={{ marginTop: t.spacing.md }}>
            Grievances: privacy@celestialsoul.app · You have the right to access, correct & erase your data.
          </Text>
        </Reveal>
      )}

      {step === 'provider' && (
        <Reveal index={0}>
          <Text variant="displayLg">Choose how to verify</Text>
          <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
            You’ll be handed to the provider securely. We never see your documents.
          </Text>
          <View style={{ marginTop: t.spacing.lg, gap: t.spacing.md }}>
            {PROVIDERS.map((p) => (
              <Pressable key={p.key} onPress={() => { haptic.light(); runProvider(p.key); }}>
                <GlassCard>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                    <Text variant="displayLg">{p.glyph}</Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="title">{p.label}</Text>
                      <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{p.help}</Text>
                    </View>
                    <Text variant="title" color="textFaint">›</Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        </Reveal>
      )}

      {step === 'running' && (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: t.spacing['4xl'] }}>
          <ActivityIndicator color={t.colors.primary} size="large" />
          <Text variant="headline" center style={{ marginTop: t.spacing.xl }}>Verifying securely…</Text>
          <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.sm, maxWidth: 260 }}>
            Confirming your identity with the provider. This stays between you and them.
          </Text>
        </View>
      )}

      {step === 'done' && (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: t.spacing.xl }}>
          <SoulMerge size={160} />
          <Text variant="overline" color="highlight" uppercase style={{ marginTop: t.spacing.lg }}>Verified</Text>
          <Text variant="displayLg" center style={{ marginTop: t.spacing.xs }}>You’re verified ✦</Text>
          <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.sm, maxWidth: 280, lineHeight: 22 }}>
            A verified badge now sits on your profile. You’ll be shown to more serious souls — and
            they’ll feel safer reaching out. Your documents were never stored.
          </Text>
          <View style={{ width: '100%', marginTop: t.spacing.xl }}>
            <Button label="Back to my profile" onPress={() => router.back()} />
          </View>
        </View>
      )}
    </SkyScreen>
  );
}
