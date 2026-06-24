/**
 * CompatibilityRing — circular progress ring that fills to the alignment score.
 * Used on match cards, the report, and profiles. The score is the explainable
 * headline number from the matching model.
 *
 * Two looks, one component (locked design language):
 *   - default: heat-scale stroke + label, for compact use on cards/lists
 *   - variant="soul": the signature gold ring with a big serif score in a
 *     glowing well (the report / discover hero). Driven by `highlight` token.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  variant?: 'default' | 'soul';
  label?: string;        // small text under the number (default look only)
}

export function CompatibilityRing({ score, size = 72, stroke = 6, variant = 'default', label = 'align' }: Props) {
  const t = useTheme();
  const soul = variant === 'soul';
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
  const strokeColor = soul ? t.colors.highlight : heat;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - progress.value),
  }));

  return (
    <View
      style={{
        width: size, height: size, alignItems: 'center', justifyContent: 'center',
        ...(soul ? { shadowColor: t.colors.highlight, shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } } : null),
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.colors.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={strokeColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          animatedProps={animatedProps}
        />
      </Svg>
      {soul ? (
        <Text variant={size >= 120 ? 'displayLg' : 'headline'} color="text">{Math.round(score)}</Text>
      ) : (
        <>
          <Text variant="title" color="text">{Math.round(score)}</Text>
          {!!label && <Text variant="overline" color="textFaint" uppercase>{label}</Text>}
        </>
      )}
    </View>
  );
}
