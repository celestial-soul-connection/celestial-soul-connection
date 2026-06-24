/**
 * Celebration — the emotional peak: "A mutual alignment."
 *
 * Two avatars drift together, a burst of soft particles radiates outward, the
 * alignment score counts up, and a glowing CTA invites the first message. Runs
 * only when feel.motion.celebrate is on. Haptic success fires on mount.
 *
 * This is intentionally a "moment" screen — full-bleed, no chrome, premium.
 */
import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SkyBackground } from '../../src/components/fx/SkyBackground';
import { SoulMerge } from '../../src/components/fx/SoulMerge';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/ThemeProvider';
import { haptic } from '../../src/lib/haptics';
import { SEED_PROFILES } from '../../src/data/seedProfiles';
import { scorePair } from '../../src/data/scoring';
import { PsychProfile } from '../../src/data/types';

// Mirror of the default "me" psych so the displayed score matches the deck.
const DEFAULT_ME_FOR_DISPLAY: PsychProfile = {
  attachmentSecure: 0.8, attachmentAnxious: 0.25, attachmentAvoidant: 0.2,
  openness: 0.75, conscientiousness: 0.72, extraversion: 0.5, agreeableness: 0.8, neuroticism: 0.3,
  wantsKids: 0.8, religiousImportance: 0.45, ambition: 0.72, familyOrientation: 0.78,
  adventurousness: 0.7, conflictRepair: 0.8, intent: 0.92,
};

export default function Celebration() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Resolve the real matched profile + score so the moment reflects who it is.
  const them = SEED_PROFILES.find((p) => p.id === id) ?? SEED_PROFILES[0];
  const score = scorePair(DEFAULT_ME_FOR_DISPLAY, them.psych).score;

  useEffect(() => {
    if (t.feel.motion.haptics) haptic.success();
  }, []);

  return (
    <SkyBackground>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: t.spacing.xl, paddingTop: insets.top, paddingBottom: insets.bottom + t.spacing.xl }}>
        {/* The signature: two lights become one */}
        <Reveal index={0}>
          <SoulMerge size={210} />
        </Reveal>

        <Reveal index={1} style={{ alignItems: 'center' }}>
          <Text variant="overline" color="highlight" uppercase style={{ marginTop: t.spacing.lg }}>Two lights become one</Text>
          <Text variant="displayXl" center style={{ marginTop: t.spacing.sm }}>Your souls</Text>
          <Text variant="displayXl" color="highlight" center style={{ fontFamily: t.fontFamily.displayItalic, marginTop: -4 }}>
            have aligned.
          </Text>
          <Text variant="bodyLg" color="textMuted" center style={{ marginTop: t.spacing.lg, maxWidth: 280, lineHeight: 24 }}>
            You &amp; {them.name} — {score}% aligned. Begin with something true, not small talk.
          </Text>
        </Reveal>

        <Reveal index={2} style={{ width: '100%', gap: t.spacing.md, marginTop: t.spacing['2xl'] }}>
          <Button label="Send the first soul probe" onPress={() => router.push({ pathname: '/match/chat', params: { id: them.id } })} />
          <Pressable onPress={() => router.push('/(tabs)/discover')} style={{ alignItems: 'center', paddingVertical: t.spacing.sm }}>
            <Text variant="label" color="textMuted">Maybe later</Text>
          </Pressable>
        </Reveal>
      </View>
    </SkyBackground>
  );
}
