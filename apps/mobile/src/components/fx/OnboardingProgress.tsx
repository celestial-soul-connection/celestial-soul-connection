/**
 * OnboardingProgress — the thin animated "emotional spine" at the top of every
 * onboarding step. Fill animates on each step change (the single biggest premium
 * onboarding signal). Use `step`/`total`.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  const t = useTheme();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0.04, Math.min(1, step / total)), { duration: 480, easing: Easing.out(Easing.cubic) });
  }, [step, total, p]);

  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));

  return (
    <View style={{ height: 5, borderRadius: 5, backgroundColor: t.colors.bgSunken, overflow: 'hidden' }}>
      <Animated.View style={fill}>
        <LinearGradient colors={t.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 5, borderRadius: 5 }} />
      </Animated.View>
    </View>
  );
}
