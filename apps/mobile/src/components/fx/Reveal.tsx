/**
 * Reveal — wrap any block to give it a refined entrance (fade + upward travel),
 * staggered by `index`. Timing/travel come from feel.motion, so the whole app's
 * entrance choreography is tunable centrally. This is the "refined & purposeful"
 * motion the user asked for.
 */
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';

export function Reveal({ children, index = 0, style }: { children: React.ReactNode; index?: number; style?: ViewStyle }) {
  const t = useTheme();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      index * t.feel.motion.revealStagger,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
  }, [p, index, t.feel.motion.revealStagger]);

  const anim = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * t.feel.motion.revealTravel }],
  }));

  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}
