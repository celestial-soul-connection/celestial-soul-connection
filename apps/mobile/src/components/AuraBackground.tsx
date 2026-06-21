/**
 * AuraBackground — the signature atmospheric backdrop. Two soft radial "auras"
 * slowly breathe (opacity + scale) on the shared aura motion timing. Sits behind
 * all screen content to give the app its depth-without-shadow look.
 *
 * Pure Reanimated + gradients; no images, so it themes automatically.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export function AuraBackground({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: t.motion.duration.aura, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, t.motion.duration.aura]);

  const auraA = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.3,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));
  const auraB = useAnimatedStyle(() => ({
    opacity: 0.4 + (1 - pulse.value) * 0.3,
    transform: [{ scale: 1.05 - pulse.value * 0.1 }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }, style]}>
      <Animated.View style={[styles.aura, { top: -120, left: -80 }, auraA]}>
        <LinearGradient colors={t.gradients.aura} style={styles.fill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>
      <Animated.View style={[styles.aura, { bottom: -140, right: -90 }, auraB]}>
        <LinearGradient colors={[t.colors.glow, 'transparent']} style={styles.fill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  aura: { position: 'absolute', width: 360, height: 360, borderRadius: 360 },
  fill: { flex: 1, borderRadius: 360 },
});
