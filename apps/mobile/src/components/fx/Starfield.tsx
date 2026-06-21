/**
 * Starfield — drifting, twinkling particle field for the cinematic backdrop.
 * Density/drift/twinkle all come from the active feel preset (feel.starfield),
 * so it's tunable centrally. Deterministic layout (no Math.random at render).
 */
import React, { useMemo } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';

/* simple deterministic pseudo-random so stars are stable across renders */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function Star({ x, y, size, delay, twinkle, drift, color }: any) {
  const o = useSharedValue(0.5);
  const ty = useSharedValue(0);
  React.useEffect(() => {
    if (twinkle) {
      o.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), -1, true));
    }
    ty.value = withDelay(delay, withRepeat(withTiming(drift, { duration: 7000, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [twinkle, delay, drift, o, ty]);
  const style = useAnimatedStyle(() => ({ opacity: 0.35 + o.value * 0.5, transform: [{ translateY: ty.value }] }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function Starfield() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const cfg = t.feel.starfield;

  const stars = useMemo(() => {
    if (!cfg.enabled) return [];
    const rand = rng(99);
    return Array.from({ length: cfg.count }).map((_, i) => ({
      key: i,
      x: rand() * width,
      y: rand() * height,
      size: 0.8 + rand() * cfg.maxSize,
      delay: rand() * 2000,
      drift: (rand() - 0.5) * cfg.drift,
    }));
  }, [cfg.enabled, cfg.count, cfg.maxSize, cfg.drift, width, height]);

  if (!cfg.enabled) return null;
  const color = t.mode === 'dark' ? '#FFFFFF' : t.colors.primary;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map(({ key, ...s }) => (
        <Star key={key} {...s} twinkle={cfg.twinkle} color={color} />
      ))}
    </View>
  );
}
