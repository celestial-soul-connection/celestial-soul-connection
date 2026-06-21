/**
 * Button — primary / secondary / ghost / danger. Pill-shaped, gradient fill on
 * primary, with a calm press animation (scale + glow) on the shared `motion`
 * physics. All colour comes from tokens.
 */
import React from 'react';
import { Pressable, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { haptic } from '../lib/haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glassLight';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, variant = 'primary', disabled, loading, fullWidth = true, style }: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onIn = () => {
    scale.value = withSpring(t.feel.motion.pressScale, t.motion.spring.gentle);
    if (t.feel.motion.haptics) haptic.light();
  };
  const onOut = () => (scale.value = withSpring(1, t.motion.spring.gentle));

  const base: ViewStyle = {
    height: 54,
    borderRadius: t.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xl,
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
  };

  const textColor =
    variant === 'primary' ? 'textOnPrimary'
    : variant === 'danger' ? 'textOnPrimary'
    : variant === 'glassLight' ? 'textOnImage'
    : variant === 'ghost' ? 'text'
    : 'primary';

  const inner = loading ? (
    <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? t.colors.textOnPrimary : t.colors.primary} />
  ) : (
    <Text variant="title" color={textColor as any}>{label}</Text>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[animStyle, style]}>
        <LinearGradient
          colors={t.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            base,
            {
              shadowColor: t.colors.primary,
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: t.feel.glow.radius,
              shadowOpacity: t.feel.glow.opacity,
              elevation: 10,
            },
          ]}>
          {inner}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const variantStyle: ViewStyle =
    variant === 'danger'
      ? { backgroundColor: t.colors.danger }
      : variant === 'secondary'
      ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: t.colors.primary }
      : variant === 'glassLight'
      ? { backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }
      : { backgroundColor: t.colors.bgSunken };

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      style={[base, variantStyle, animStyle, style]}>
      {inner}
    </AnimatedPressable>
  );
}

export const styles = StyleSheet.create({});
