/**
 * SkyBackground — the signature "living sky" backdrop from the locked design.
 *
 * Layers, back to front (mirrors design/mockups-final.html `.sky`):
 *   1. base colour            → colors.bg
 *   2. three breathing nebula → gradients.nebula (blurred, blend, slow pulse)
 *   3. twinkling fixed stars  → reuses <Starfield/>
 *   4. falling gold stardust  → colors.highlight motes drifting downward
 *   5. bottom veil            → fade into colors.bg for text legibility
 *
 * Every colour comes from theme tokens, so it restyles across all 4 themes
 * × light/dark with zero edits. Wrap screens in <SkyScreen/> (below) which
 * adds safe-area + this backdrop.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { Starfield } from './Starfield';

/* deterministic pseudo-random so motes are stable across renders */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** One slow-breathing nebula blob. */
function Nebula({ color, size, top, left, bottom, right, delay, opacity }: {
  color: string; size: number; top?: number; left?: number; bottom?: number; right?: number; delay: number; opacity: number;
}) {
  const t = useTheme();
  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: t.motion.duration.aura * 2, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [p, delay, t.motion.duration.aura]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity * (0.62 + p.value * 0.38),
    transform: [{ scale: 1 + p.value * 0.18 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute', width: size, height: size, borderRadius: size,
          backgroundColor: color, top, left, bottom, right,
        },
        style,
      ]}
    />
  );
}

/** A single gold mote falling from top to bottom on a loop. */
function Dust({ x, duration, delay, height, color }: { x: number; duration: number; delay: number; height: number; color: string }) {
  const y = useSharedValue(-20);
  const o = useSharedValue(0);
  React.useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(height + 20, { duration, easing: Easing.linear }), -1, false));
    o.value = withDelay(delay, withRepeat(withTiming(1, { duration: duration * 0.5, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [y, o, duration, delay, height]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: o.value * 0.85 }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x, top: 0, width: 2, height: 2, borderRadius: 2, backgroundColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
        style,
      ]}
    />
  );
}

export function SkyBackground({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const [n1, n2, n3] = t.gradients.nebula;

  const motes = useMemo(() => {
    const rand = rng(31);
    return Array.from({ length: 12 }).map((_, i) => ({
      key: i,
      x: rand() * width,
      duration: (rand() * 8 + 6) * 1000,
      delay: rand() * 8000,
    }));
  }, [width]);

  // Veil: transparent at top, fading into bg toward the bottom for legibility.
  const veil: [string, string, string] = ['transparent', 'transparent', t.colors.bg];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg, overflow: 'hidden' }, style]}>
      {/* nebula layer — three blobs, mockup positions */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Nebula color={n1} size={width * 0.86} top={-height * 0.06} left={-width * 0.18} delay={0} opacity={0.5} />
        <Nebula color={n2} size={width * 0.7} bottom={height * 0.02} right={-width * 0.2} delay={t.motion.duration.aura} opacity={0.5} />
        <Nebula color={n3} size={width * 0.52} top={height * 0.4} left={width * 0.18} delay={t.motion.duration.aura * 1.6} opacity={0.42} />
      </View>

      {/* fixed twinkling stars (reused primitive) */}
      <Starfield />

      {/* falling gold stardust */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {motes.map(({ key, ...m }) => (
          <Dust key={key} {...m} height={height} color={t.colors.highlight} />
        ))}
      </View>

      {/* bottom veil */}
      <LinearGradient colors={veil} locations={[0, 0.55, 0.98]} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {children}
    </View>
  );
}
