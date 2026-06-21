/**
 * Daily Match — the heart of the app, rebuilt to a premium bar.
 *
 * A full-bleed candidate photo with a glassmorphic info panel floating over the
 * bottom, an animated compatibility ring, the explainable "why you align"
 * dimensions revealing in sequence, and a glass soul-probe card. High matches get
 * a celebratory glow. Tapping "It's a match" routes to the celebration moment.
 *
 * Every effect intensity is feel-driven; photo + data are placeholders to swap.
 */
import React from 'react';
import { View, useWindowDimensions, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { GlassCard } from '../../src/components/fx/GlassCard';
import { Reveal } from '../../src/components/fx/Reveal';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { CompatibilityRing } from '../../src/components/CompatibilityRing';
import { useTheme } from '../../src/theme/ThemeProvider';

const PHOTO =
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1200&auto=format&fit=crop';

const MATCH = {
  name: 'Aria',
  age: 29,
  blurb: 'Designer · Pune · 8th-house Venus',
  score: 89,
  reasons: [
    { dim: 'Values & life goals', pct: 92, tone: 'primary' as const },
    { dim: 'Secure attachment fit', pct: 88, tone: 'success' as const },
    { dim: 'Conflict & communication', pct: 81, tone: 'accent' as const },
    { dim: 'Shared novelty', pct: 76, tone: 'neutral' as const },
  ],
  probe: 'What’s a fear you recently released that let more light into your life?',
};

export default function DailyMatch() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  return (
    <CinematicBackground>
      {/* Full-bleed candidate photo across the top */}
      <Image source={PHOTO} style={{ width, height: height * 0.62, position: 'absolute', top: 0 }} contentFit="cover" transition={500} />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 }}
      />
      <LinearGradient
        colors={['transparent', hexA(t.colors.bg, 0.5), t.colors.bg]}
        locations={[0, 0.7, 1]}
        style={{ position: 'absolute', top: height * 0.32, left: 0, right: 0, height: height * 0.32 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + t.spacing.md, paddingBottom: insets.bottom + t.spacing.xl, paddingHorizontal: t.spacing.xl }}>
        {/* Header row over the photo */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="overline" color="textOnPrimary" uppercase style={{ opacity: 0.9 }}>Your alignment today</Text>
          </View>
          <Chip label="2 of 5 left" tone="accent" />
        </View>

        {/* Push the glass panel down over the lower third of the photo */}
        <View style={{ height: height * 0.40 }} />

        <Reveal index={0}>
          <GlassCard glow={MATCH.score >= 85}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: t.spacing.md }}>
                <Text variant="displayLg">{MATCH.name}, {MATCH.age}</Text>
                <Text variant="body" color="textMuted" style={{ marginTop: 2 }}>{MATCH.blurb}</Text>
              </View>
              <CompatibilityRing score={MATCH.score} size={84} />
            </View>

            <Text variant="overline" color="textFaint" uppercase style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
              Why you align
            </Text>
            {MATCH.reasons.map((r, i) => (
              <Reveal key={r.dim} index={i + 1}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
                  <Chip label={r.dim} tone={r.tone} />
                  <Text variant="label" color="textMuted">{r.pct}%</Text>
                </View>
              </Reveal>
            ))}
          </GlassCard>
        </Reveal>

        <Reveal index={6} style={{ marginTop: t.spacing.lg }}>
          <GlassCard>
            <Text variant="overline" color="primary" uppercase>Soul probe</Text>
            <Text variant="headline" style={{ marginTop: t.spacing.sm, fontFamily: t.fontFamily.displayItalic }}>
              “{MATCH.probe}”
            </Text>
          </GlassCard>
        </Reveal>

        <Reveal index={7} style={{ marginTop: t.spacing.xl, gap: t.spacing.md }}>
          <Button label="Open a meaningful thread" onPress={() => router.push('/match/celebration')} />
          <Button label="Not aligned — pass" variant="secondary" onPress={() => router.push('/match/daily')} />
          <Text variant="caption" color="textFaint" center>
            Numbers stay private. Contact details only unlock — for a nominal fee — once you're a mutual match.
          </Text>
          <Button label="Theme & privacy settings" variant="ghost" onPress={() => router.push('/settings/theme')} />
        </Reveal>
      </ScrollView>
    </CinematicBackground>
  );
}

function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}
