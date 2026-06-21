/**
 * Text — the ONLY text primitive. Never use react-native <Text> directly in
 * screens; always go through this so type scale, font, and colour stay on-token.
 */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { TypographyVariant } from '../theme/tokens';

type ColorToken = 'text' | 'textMuted' | 'textFaint' | 'textOnPrimary' | 'textOnAccent' | 'primary' | 'accent' | 'danger' | 'success';

interface Props extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  center?: boolean;
  uppercase?: boolean;
}

export function Text({ variant = 'body', color = 'text', center, uppercase, style, ...rest }: Props) {
  const t = useTheme();
  const scale = t.typography[variant];
  const family = t.fontFamily[scale.font as keyof typeof t.fontFamily];

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: family,
          fontSize: scale.size,
          lineHeight: scale.lineHeight,
          letterSpacing: scale.letterSpacing,
          color: t.colors[color],
          textAlign: center ? 'center' : undefined,
          textTransform: uppercase ? 'uppercase' : undefined,
        },
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({});
