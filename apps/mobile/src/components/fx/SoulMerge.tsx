/**
 * SoulMerge — THE signature animation. Two lights spiral together, collide in a
 * flash, and bloom into one golden star, which holds, rests, then repeats.
 * A 9-second loop (mirrors design/mockups-final.html `.merge`):
 *   0–55%  two orbs spiral inward + shrink toward centre
 *   52–64% white flash
 *   55–92% gold star blooms and holds, halo ring expands
 *   92–100% gentle rest, then loop
 *
 * Motion MEANS something (two souls becoming one) and RESOLVES — never an
 * endless spin. Colours come from tokens: the two orbs use the theme's match
 * gradient endpoints (primary + accent), the bloomed star uses `highlight`.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, interpolate, Extrapolation } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';

const LOOP = 9000; // ms

export function SoulMerge({ size = 200 }: { size?: number }) {
  const t = useTheme();
  const p = useSharedValue(0); // 0..1 progress over the loop

  React.useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: LOOP, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [p]);

  const reach = size * 0.55; // how far the orbs start out from centre
  const orbSize = size * 0.19;
  const starSize = size * 0.31;

  // Left orb: spirals in from the left, shrinks to nothing by the merge point.
  const orbL = useAnimatedStyle(() => {
    const x = interpolate(p.value, [0, 0.45, 0.6], [-reach, reach * 0.2, 0], Extrapolation.CLAMP);
    const y = interpolate(p.value, [0, 0.45, 0.6], [-reach * 0.28, 0, 0], Extrapolation.CLAMP);
    const s = interpolate(p.value, [0, 0.12, 0.45, 0.6], [0.7, 1, 1, 0], Extrapolation.CLAMP);
    const o = interpolate(p.value, [0, 0.12, 0.55, 0.6], [0, 1, 1, 0], Extrapolation.CLAMP);
    const rot = interpolate(p.value, [0, 0.45], [0, -200], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }, { scale: s }] };
  });

  // Right orb: mirror.
  const orbR = useAnimatedStyle(() => {
    const x = interpolate(p.value, [0, 0.45, 0.6], [reach, -reach * 0.2, 0], Extrapolation.CLAMP);
    const y = interpolate(p.value, [0, 0.45, 0.6], [reach * 0.28, 0, 0], Extrapolation.CLAMP);
    const s = interpolate(p.value, [0, 0.12, 0.45, 0.6], [0.7, 1, 1, 0], Extrapolation.CLAMP);
    const o = interpolate(p.value, [0, 0.12, 0.55, 0.6], [0, 1, 1, 0], Extrapolation.CLAMP);
    const rot = interpolate(p.value, [0, 0.45], [0, -20], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }, { scale: s }] };
  });

  // White flash at collision.
  const flash = useAnimatedStyle(() => {
    const o = interpolate(p.value, [0.5, 0.57, 0.64], [0, 1, 0], Extrapolation.CLAMP);
    const s = interpolate(p.value, [0.5, 0.57, 0.64], [0, 8, 12], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ scale: s }] };
  });

  // Gold star blooms and holds.
  const star = useAnimatedStyle(() => {
    const o = interpolate(p.value, [0.55, 0.64, 0.92, 1], [0, 1, 1, 0], Extrapolation.CLAMP);
    const s = interpolate(p.value, [0.55, 0.64, 0.8, 0.92, 1], [0, 1.12, 1, 1.03, 0.6], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ scale: s }] };
  });

  // Halo ring expands outward as the star settles.
  const halo = useAnimatedStyle(() => {
    const o = interpolate(p.value, [0.57, 0.66, 0.82], [0, 0.7, 0], Extrapolation.CLAMP);
    const s = interpolate(p.value, [0.57, 0.82], [1, 3], Extrapolation.CLAMP);
    return { opacity: o, transform: [{ scale: s }] };
  });

  const center = (w: number): any => ({ position: 'absolute', top: size / 2 - w / 2, left: size / 2 - w / 2, width: w, height: w });

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      {/* Left orb (brand/primary light) */}
      <Animated.View style={[center(orbSize), { borderRadius: orbSize, backgroundColor: t.colors.primary, shadowColor: t.colors.primary, shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }, orbL]} />
      {/* Right orb (accent light) */}
      <Animated.View style={[center(orbSize), { borderRadius: orbSize, backgroundColor: t.colors.accent, shadowColor: t.colors.accent, shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }, orbR]} />
      {/* Flash */}
      <Animated.View style={[center(size * 0.05), { borderRadius: size, backgroundColor: t.colors.textOnImage }, flash]} />
      {/* Halo ring */}
      <Animated.View style={[center(starSize), { borderRadius: starSize, borderWidth: 1, borderColor: t.colors.highlight }, halo]} />
      {/* Bloomed gold star */}
      <Animated.View style={[center(starSize), { borderRadius: starSize, backgroundColor: t.colors.highlight, shadowColor: t.colors.highlight, shadowOpacity: 1, shadowRadius: 30, shadowOffset: { width: 0, height: 0 } }, star]} />
    </View>
  );
}
