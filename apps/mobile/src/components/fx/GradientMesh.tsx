/**
 * GradientMesh — slow-drifting soft colour blobs that give the background a
 * living, premium "aurora" depth. Blob count / blur / opacity / speed come from
 * feel.mesh. Colours pull from the active palette gradients so it themes itself.
 */
import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function Blob({ x, y, size, delay, duration, colors, blur, opacity, dx, dy }: any) {
  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [delay, duration, p]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity * (0.7 + p.value * 0.3),
    transform: [{ translateX: p.value * dx }, { translateY: p.value * dy }, { scale: 1 + p.value * 0.18 }],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size },
        // expo-blur is heavy for big blobs; a soft radial via gradient + RN's
        // built-in is enough. We fake blur with layered low-opacity gradient.
        Platform_blur(blur),
        style,
      ]}>
      <LinearGradient colors={colors} start={{ x: 0.2, y: 0.1 }} end={{ x: 0.9, y: 0.9 }} style={{ flex: 1, borderRadius: size }} />
    </Animated.View>
  );
}

/* Use elevation-free soft edges; heavy GPU blur is avoided for perf on phones. */
function Platform_blur(_b: number) {
  return { overflow: 'hidden' as const };
}

export function GradientMesh() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const cfg = t.feel.mesh;

  const blobs = useMemo(() => {
    if (!cfg.enabled) return [];
    const rand = rng(7);
    const palettes = [t.gradients.aura, [t.colors.glow, 'transparent'], t.gradients.brand, t.gradients.match];
    return Array.from({ length: cfg.blobCount }).map((_, i) => {
      const size = 240 + rand() * 220;
      return {
        key: i,
        x: rand() * width - size * 0.3,
        y: rand() * height - size * 0.2,
        size,
        delay: rand() * 3000,
        duration: cfg.driftDuration * (0.8 + rand() * 0.5),
        colors: palettes[i % palettes.length],
        dx: (rand() - 0.5) * 80,
        dy: (rand() - 0.5) * 80,
      };
    });
  }, [cfg.enabled, cfg.blobCount, cfg.driftDuration, width, height, t]);

  if (!cfg.enabled) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {blobs.map(({ key, ...b }) => (
        <Blob key={key} {...b} blur={cfg.blur} opacity={cfg.opacity} />
      ))}
    </View>
  );
}
