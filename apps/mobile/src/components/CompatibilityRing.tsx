/**
 * CompatibilityRing — circular progress ring that fills with the heat-scale
 * colour matching the alignment percentage. Used on match cards and profiles.
 * The score is shown as the explainable headline number from the matching model.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CompatibilityRing({ score, size = 72, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(Math.max(score, 0), 100) / 100, {
      duration: t.motion.duration.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, progress, t.motion.duration.slow]);

  const heat = score >= 85 ? t.colors.heat3 : score >= 70 ? t.colors.heat2 : score >= 50 ? t.colors.heat1 : t.colors.heat0;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.colors.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={heat}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text variant="title" color="text">{Math.round(score)}</Text>
      <Text variant="overline" color="textFaint" uppercase>align</Text>
    </View>
  );
}
