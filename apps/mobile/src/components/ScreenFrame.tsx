/**
 * ScreenFrame — wraps every screen: safe-area padding, aura backdrop, and a
 * staggered fade-up entrance for its children. Use as the root of each screen so
 * page-load motion is consistent app-wide (one orchestrated reveal, not scattered).
 */
import React, { useEffect } from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { CinematicBackground } from './fx/CinematicBackground';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function ScreenFrame({ children, scroll = true, contentStyle }: Props) {
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
    paddingTop: insets.top + t.spacing.md,
    paddingBottom: insets.bottom + t.spacing.xl,
    paddingHorizontal: t.spacing.xl,
  };

  const body = <Animated.View style={[animStyle, contentStyle]}>{children}</Animated.View>;

  return (
    <CinematicBackground>
      {scroll ? (
        <ScrollView contentContainerStyle={pad} showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={[pad, { flex: 1 }]}>{body}</View>
      )}
    </CinematicBackground>
  );
}
