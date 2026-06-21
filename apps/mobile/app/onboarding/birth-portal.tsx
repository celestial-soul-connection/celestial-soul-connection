/**
 * Birth Portal — collects birth details for matching AND demonstrates the
 * privacy-first consent model: each data use is a SEPARATE, withdrawable toggle
 * with the correct default (off where opt-in is legally required). See the
 * privacy-compliance skill — this screen is the reference implementation.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/ScreenFrame';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { Toggle } from '../../src/components/Toggle';
import { useTheme } from '../../src/theme/ThemeProvider';

/** Mirrors backend consent purposes. `required` purposes cannot be turned off. */
type Consent = { key: string; label: string; help: string; required?: boolean; default?: boolean };
const CONSENTS: Consent[] = [
  { key: 'birth_data_matching', label: 'Use my birth details for matching', help: 'Date, time & place of birth, encrypted and never shown to others.', required: true },
  { key: 'psychometric_profiling', label: 'Build my psychological profile', help: 'Attachment, values & goals power your compatibility score.', required: true },
  { key: 'photo_display_to_matches', label: 'Show my photos to matches only', help: 'Visible to a confirmed match, never publicly.', default: true },
  { key: 'product_analytics', label: 'Share anonymous usage analytics', help: 'Helps us improve. Pseudonymised. Optional.', default: false },
  { key: 'marketing_comms', label: 'Send me tips & offers', help: 'Optional. Withdraw anytime in Settings.', default: false },
];

export default function BirthPortal() {
  const t = useTheme();
  const router = useRouter();
  const [consent, setConsent] = useState<Record<string, boolean>>(
    Object.fromEntries(CONSENTS.map((c) => [c.key, c.required ? true : c.default ?? false])),
  );

  const canContinue = CONSENTS.filter((c) => c.required).every((c) => consent[c.key]);

  return (
    <ScreenFrame>
      <Chip label="Step 1 · The Birth Portal" tone="accent" />
      <Text variant="displayLg" style={{ marginTop: t.spacing.lg }}>Your cosmic coordinates</Text>
      <Text variant="body" color="textMuted" style={{ marginTop: t.spacing.sm }}>
        We use your birth moment to map your celestial story — and your answers to
        understand who you are. You decide exactly how each is used.
      </Text>

      {/* Birth fields (visual placeholders — wired to forms next) */}
      <Card style={{ marginTop: t.spacing.xl }}>
        <Field t={t} label="Date of birth" value="Tap to select — 18+ only" />
        <Divider t={t} />
        <Field t={t} label="Time of birth" value="As precise as you can" />
        <Divider t={t} />
        <Field t={t} label="Place of birth" value="City, country" />
      </Card>

      <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing['2xl'], marginBottom: t.spacing.sm }}>
        Your consent · granular & withdrawable
      </Text>

      {CONSENTS.map((c) => (
        <Card key={c.key} style={{ marginBottom: t.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: t.spacing.lg }}>
              <Text variant="title">{c.label}</Text>
              <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{c.help}</Text>
              {c.required && <Chip label="Required for matching" tone="primary" style={{ marginTop: t.spacing.sm }} />}
            </View>
            <Toggle
              value={consent[c.key]}
              disabled={c.required}
              onChange={(v) => setConsent((s) => ({ ...s, [c.key]: v }))}
            />
          </View>
        </Card>
      ))}

      <Text variant="caption" color="textFaint" style={{ marginVertical: t.spacing.lg }}>
        Each choice is logged to an append-only consent record you can review or revoke
        anytime in Settings. Your birth and chat data are encrypted. We never sell your data.
      </Text>

      <Button label="Create my soul blueprint" disabled={!canContinue} onPress={() => router.push('/match/daily')} />
    </ScreenFrame>
  );
}

function Field({ t, label, value }: { t: ReturnType<typeof useTheme>; label: string; value: string }) {
  return (
    <View style={{ paddingVertical: t.spacing.sm }}>
      <Text variant="overline" color="textFaint" uppercase>{label}</Text>
      <Text variant="bodyLg" color="textMuted" style={{ marginTop: 4 }}>{value}</Text>
    </View>
  );
}
function Divider({ t }: { t: ReturnType<typeof useTheme> }) {
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: t.spacing.xs }} />;
}
