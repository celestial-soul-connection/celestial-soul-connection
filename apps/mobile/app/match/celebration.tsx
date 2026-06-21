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
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, withRepeat, Easing,
} from 'react-native-reanimated';
import { CinematicBackground } from '../../src/components/fx/CinematicBackground';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { useTheme } from '../../src/theme/ThemeProvider';
import { haptic } from '../../src/lib/haptics';
import { SEED_PROFILES } from '../../src/data/seedProfiles';
import { scorePair } from '../../src/data/scoring';
import { PsychProfile } from '../../src/data/types';

const ME = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop';

// Mirror of the default "me" psych so the displayed score matches the deck.
const DEFAULT_ME_FOR_DISPLAY: PsychProfile = {
  attachmentSecure: 0.8, attachmentAnxious: 0.25, attachmentAvoidant: 0.2,
  openness: 0.75, conscientiousness: 0.72, extraversion: 0.5, agreeableness: 0.8, neuroticism: 0.3,
  wantsKids: 0.8, religiousImportance: 0.45, ambition: 0.72, familyOrientation: 0.78,
  adventurousness: 0.7, conflictRepair: 0.8, intent: 0.92,
};

function rng(seed: number) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function Particle({ angle, dist, delay, color, size }: any) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: (1 - p.value) * 0.9,
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value },
      { scale: 0.4 + p.value * 0.9 },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: color }, style]} />;
}

export default function Celebration() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Resolve the real matched profile + score so the moment reflects who it is.
  const them = SEED_PROFILES.find((p) => p.id === id) ?? SEED_PROFILES[0];
  const score = scorePair(DEFAULT_ME_FOR_DISPLAY, them.psych).score;

  const meX = useSharedValue(-70);
  const themX = useSharedValue(70);
  const ringScale = useSharedValue(0.6);
  const titleP = useSharedValue(0);

  useEffect(() => {
    if (t.feel.motion.haptics) haptic.success();
    meX.value = withDelay(200, withSpring(-26, { damping: 14, stiffness: 120 }));
    themX.value = withDelay(200, withSpring(26, { damping: 14, stiffness: 120 }));
    ringScale.value = withDelay(150, withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true));
    titleP.value = withDelay(650, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  const meStyle = useAnimatedStyle(() => ({ transform: [{ translateX: meX.value }] }));
  const themStyle = useAnimatedStyle(() => ({ transform: [{ translateX: themX.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.5 - ringScale.value * 0.3, transform: [{ scale: 0.6 + ringScale.value * 0.7 }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleP.value, transform: [{ translateY: (1 - titleP.value) * 18 }] }));

  const particles = React.useMemo(() => {
    const rand = rng(13);
    const cols = [t.colors.primary, t.colors.accent, t.colors.heat3, '#FFFFFF'];
    return Array.from({ length: 28 }).map((_, i) => ({
      key: i, angle: rand() * Math.PI * 2, dist: 110 + rand() * 150,
      delay: 200 + rand() * 500, color: cols[i % cols.length], size: 5 + rand() * 7,
    }));
  }, [t]);

  return (
    <CinematicBackground>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: t.spacing.xl, paddingBottom: insets.bottom }}>
        {/* Avatar duo + burst, centered */}
        <View style={{ height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing['2xl'] }}>
          {/* pulsing glow ring behind */}
          <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, ringStyle]}>
            <View style={{ width: 220, height: 220, borderRadius: 220, backgroundColor: t.colors.glow }} />
          </Animated.View>
          {/* particles */}
          <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
            {particles.map(({ key, ...p }) => <Particle key={key} {...p} />)}
          </View>
          {/* avatars */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={meStyle}>
              <Avatar uri={ME} t={t} />
            </Animated.View>
            <Animated.View style={themStyle}>
              <Avatar uri={them.photo} t={t} />
            </Animated.View>
          </View>
        </View>

        <Animated.View style={[{ alignItems: 'center' }, titleStyle]}>
          <Text variant="overline" color="accent" uppercase>A mutual alignment</Text>
          <Text variant="displayXl" center style={{ marginTop: t.spacing.sm }}>You & {them.name}</Text>
          <Text variant="displayLg" color="primary" center style={{ fontFamily: t.fontFamily.displayItalic, marginTop: -2 }}>
            are {score}% aligned
          </Text>
          <Text variant="body" color="textMuted" center style={{ marginTop: t.spacing.lg, maxWidth: 300 }}>
            Two secure hearts, shared values, and room to grow together. Begin with a
            soul probe rather than small talk.
          </Text>
        </Animated.View>

        <View style={{ width: '100%', gap: t.spacing.md, marginTop: t.spacing['3xl'] }}>
          <Button label="Send the first soul probe" onPress={() => router.push({ pathname: '/match/chat', params: { id: them.id } })} />
          <Pressable onPress={() => router.push('/match/daily')} style={{ alignItems: 'center', paddingVertical: t.spacing.sm }}>
            <Text variant="label" color="textMuted">Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </CinematicBackground>
  );
}

function Avatar({ uri, t }: { uri: string; t: ReturnType<typeof useTheme> }) {
  return (
    <View
      style={{
        width: 104, height: 104, borderRadius: 104, borderWidth: 3, borderColor: t.colors.bgElevated,
        shadowColor: t.colors.primary, shadowOpacity: t.feel.glow.opacity, shadowRadius: t.feel.glow.radius,
        shadowOffset: { width: 0, height: 8 }, elevation: 10,
      }}>
      <Image source={uri} style={{ width: '100%', height: '100%', borderRadius: 104 }} contentFit="cover" transition={400} />
    </View>
  );
}
