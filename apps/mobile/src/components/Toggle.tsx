/**
 * Toggle — token-driven switch used for granular consent toggles and settings.
 * Animated thumb on the shared spring physics.
 */
import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const t = useTheme();
  const W = 50, H = 30, PAD = 3, THUMB = H - PAD * 2;

  const track = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? t.colors.primary : t.colors.bgSunken, { duration: t.motion.duration.fast }),
  }));
  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? W - THUMB - PAD : PAD, t.motion.spring.gentle) }],
  }));

  return (
    <Pressable onPress={() => !disabled && onChange(!value)} hitSlop={8} style={{ opacity: disabled ? 0.5 : 1 }}>
      <Animated.View style={[{ width: W, height: H, borderRadius: H, justifyContent: 'center', borderWidth: 1, borderColor: t.colors.border }, track]}>
        <Animated.View
          style={[
            { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB, backgroundColor: t.colors.bgElevated },
            thumb,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
