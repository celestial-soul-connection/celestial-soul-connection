/**
 * Welcome — cinematic first impression.
 *
 * Full-bleed hero image with a slow Ken-Burns drift, a layered gradient scrim
 * for legibility, drifting starfield/mesh behind it, and a staggered poetic
 * reveal of the headline + CTAs. All effect intensities come from the active
 * feel preset (feel.ts) so the whole vibe is tunable from one place.
 *
 * Swap HERO_IMAGE for your own brand photography — that single change carries
 * most of the "premium" weight.
 */
import React, { useEffect } from 'react';
import { View, useWindowDimensions, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { CinematicBackground } from '../src/components/fx/CinematicBackground';
import { Reveal } from '../src/components/fx/Reveal';
import { Text } from '../src/components/Text';
import { Button } from '../src/components/Button';
import { Chip } from '../src/components/Chip';
import { useTheme } from '../src/theme/ThemeProvider';

// Swap this for your own brand hero. A warm, intimate, cinematic couple/portrait.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop';

export default function Welcome() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Ken Burns: slow scale + drift on the hero image.
  const kb = useSharedValue(0);
  useEffect(() => {
    if (!t.feel.hero.kenBurns) return;
    kb.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [kb, t.feel.hero.kenBurns]);
  const kbStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + kb.value * (t.feel.hero.kenBurnsScale - 1) },
      { translateX: kb.value * -t.feel.hero.parallax },
      { translateY: kb.value * -t.feel.hero.parallax * 0.6 },
    ],
  }));

  return (
    <CinematicBackground>
      {/* Hero image fills the upper ~70% and bleeds under the content. */}
      <Animated.View style={[StyleSheet.absoluteFill, kbStyle]}>
        <Image source={HERO_IMAGE} style={{ width, height: height * 0.82 }} contentFit="cover" transition={600} />
      </Animated.View>

      {/* Scrims: top vignette for status bar, strong bottom gradient for text. */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }}
      />
      {/* Always-dark bottom scrim so light hero text is legible in EVERY palette. */}
      <LinearGradient
        colors={['transparent', 'rgba(10,6,16,0.35)', 'rgba(10,6,16,0.78)', 'rgba(10,6,16,0.94)']}
        locations={[0, 0.4, 0.72, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.7 }}
      />

      {/* Content sits over the bottom of the hero. */}
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: t.spacing.xl,
          paddingBottom: insets.bottom + t.spacing.xl,
        }}>
        <Reveal index={0}>
          <Chip label="Intentional connection" tone="primary" />
        </Reveal>

        <Reveal index={1}>
          <Text variant="displayXl" color="textOnImage" onImage style={{ marginTop: t.spacing.lg }}>
            Find the soul
          </Text>
        </Reveal>
        <Reveal index={2}>
          <Text
            variant="displayXl"
            color="textOnImage"
            onImage
            style={{ fontFamily: t.fontFamily.displayItalic, marginTop: -4 }}>
            that aligns with yours.
          </Text>
        </Reveal>

        <Reveal index={3}>
          <Text variant="bodyLg" color="textOnImageMuted" onImage style={{ marginTop: t.spacing.lg }}>
            One meaningful match a day — matched on who you really are: attachment,
            values, and life goals, woven with your celestial story.
          </Text>
        </Reveal>

        <Reveal index={4} style={{ marginTop: t.spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: t.spacing.lg, marginBottom: t.spacing.xl }}>
            <Trait t={t} label="Verified · 18+" />
            <Trait t={t} label="No number sharing" />
            <Trait t={t} label="Privacy-first" />
          </View>
        </Reveal>

        <Reveal index={5} style={{ gap: t.spacing.md }}>
          <Button label="Begin your alignment" onPress={() => router.push('/onboarding/birth-portal')} />
          <Button label="I already have an account" variant="glassLight" onPress={() => router.push('/match/daily')} />
          <Text variant="caption" color="textOnImageMuted" onImage center style={{ marginTop: t.spacing.xs }}>
            By continuing you agree to granular, withdrawable consent. You choose what we use.
          </Text>
          <Pressable onPress={() => router.push('/settings/theme')} style={{ alignSelf: 'center', paddingVertical: t.spacing.sm }}>
            <Text variant="label" color="textOnImage" onImage>✦ Try a different style</Text>
          </Pressable>
        </Reveal>
      </View>
    </CinematicBackground>
  );
}

function Trait({ t, label }: { t: ReturnType<typeof useTheme>; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: t.colors.accent, marginBottom: t.spacing.sm }} />
      <Text variant="caption" color="textOnImageMuted" onImage>{label}</Text>
    </View>
  );
}

function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}
