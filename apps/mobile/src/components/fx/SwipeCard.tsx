/**
 * SwipeCard — Tinder-style swipeable card (Gesture Handler + Reanimated, both in
 * Expo Go). Drag right = align/like, left = pass. Card rotates & fades with the
 * drag, snaps back if released near centre, flies off past threshold. Shows
 * "ALIGN" / "PASS" stamps that fade in as you drag.
 *
 * Works fully in Expo Go — no Skia/Lottie needed.
 */
import React from 'react';
import { StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { haptic } from '../../lib/haptics';

interface Props {
  children: React.ReactNode;
  onLike?: () => void;
  onPass?: () => void;
  style?: ViewStyle;
}

export function SwipeCard({ children, onLike, onPass, style }: Props) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const THRESHOLD = width * 0.28;

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const fireHaptic = () => haptic.medium();

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (e.translationX > THRESHOLD) {
        x.value = withTiming(width * 1.4, { duration: 260 });
        if (t.feel.motion.haptics) runOnJS(fireHaptic)();
        if (onLike) runOnJS(onLike)();
      } else if (e.translationX < -THRESHOLD) {
        x.value = withTiming(-width * 1.4, { duration: 260 });
        if (t.feel.motion.haptics) runOnJS(fireHaptic)();
        if (onPass) runOnJS(onPass)();
      } else {
        x.value = withSpring(0, t.motion.spring.gentle);
        y.value = withSpring(0, t.motion.spring.gentle);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotateZ: `${interpolate(x.value, [-width, width], [-12, 12], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP) }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-THRESHOLD, 0], [1, 0], Extrapolation.CLAMP) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[cardStyle, style]}>
        {children}
        <Animated.View style={[styles.stamp, { left: 18, borderColor: t.colors.success, transform: [{ rotate: '-14deg' }] }, likeStyle]}>
          <Text variant="title" color="success">ALIGN</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, { right: 18, borderColor: t.colors.danger, transform: [{ rotate: '14deg' }] }, passStyle]}>
          <Text variant="title" color="danger">PASS</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: 'absolute', top: 26, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 3, borderRadius: 12,
  },
});
