/**
 * SkyScreen — the screen shell for the locked "living sky" design language.
 * Safe-area + <SkyBackground/> (breathing nebula, stars, stardust, veil) + a
 * single orchestrated fade-up entrance. The mockup's `.screen` + `.ui`.
 *
 * Use as the root of every redesigned screen. For full-bleed layouts (e.g. a
 * photo deck) pass `scroll={false}` and lay out children with flex.
 */
import React, { useEffect } from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { SkyBackground } from './fx/SkyBackground';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  /** Center children vertically (welcome / match moments). */
  center?: boolean;
}

export function SkyScreen({ children, scroll = true, contentStyle, center = false }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.value = withTiming(1, { duration: t.motion.duration.base, easing: Easing.out(Easing.cubic) });
  }, [reveal, t.motion.duration.base]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 16 }],
  }));

  const pad: ViewStyle = {
    paddingTop: insets.top + t.spacing.lg,
    paddingBottom: insets.bottom + t.spacing.xl,
    paddingHorizontal: t.spacing.xl,
  };

  const body = <Animated.View style={[animStyle, contentStyle]}>{children}</Animated.View>;

  return (
    <SkyBackground>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[pad, center && { flexGrow: 1, justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={[pad, { flex: 1 }, center && { justifyContent: 'center' }]}>{body}</View>
      )}
    </SkyBackground>
  );
}
