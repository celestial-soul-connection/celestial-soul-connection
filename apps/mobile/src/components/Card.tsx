/**
 * Card — the standard elevated surface. Soft tinted shadow, token radius.
 * `glow` adds the ambient aura ring used for high-priority / match cards.
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  children: React.ReactNode;
  glow?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export function Card({ children, glow, padded = true, style }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.bgElevated,
          borderRadius: t.radii.xl,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: padded ? t.spacing.xl : 0,
          shadowColor: glow ? t.colors.primary : '#000',
          ...t.elevation.sm,
          shadowOpacity: glow ? 0.28 : t.mode === 'dark' ? 0.4 : 0.08,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
