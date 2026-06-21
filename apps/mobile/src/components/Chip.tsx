/**
 * Chip — pill tag for traits, interests, dimensions. `tone` selects the token
 * surface. Used everywhere a small labelled token is needed.
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'danger';

export function Chip({ label, tone = 'neutral', style }: { label: string; tone?: Tone; style?: ViewStyle }) {
  const t = useTheme();
  const map: Record<Tone, { bg: string; fg: any }> = {
    neutral: { bg: t.colors.bgSunken, fg: 'textMuted' },
    primary: { bg: t.colors.primarySoft, fg: 'primary' },
    accent: { bg: t.colors.accentSoft, fg: 'textOnAccent' },
    success: { bg: t.colors.dangerSoft, fg: 'success' },
    danger: { bg: t.colors.dangerSoft, fg: 'danger' },
  };
  const c = map[tone];
  return (
    <View
      style={[
        {
          backgroundColor: c.bg,
          borderRadius: t.radii.pill,
          paddingVertical: t.spacing.xs + 2,
          paddingHorizontal: t.spacing.md,
          alignSelf: 'flex-start',
        },
        style,
      ]}>
      <Text variant="label" color={c.fg}>{label}</Text>
    </View>
  );
}
