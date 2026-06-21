/**
 * Text — the ONLY text primitive. Never use react-native <Text> directly in
 * screens; always go through this so type scale, font, and colour stay on-token.
 */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { TypographyVariant } from '../theme/tokens';

type ColorToken =
  | 'text' | 'textMuted' | 'textFaint' | 'textOnPrimary' | 'textOnAccent'
  | 'textOnImage' | 'textOnImageMuted'
  | 'primary' | 'accent' | 'danger' | 'success';

interface Props extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  center?: boolean;
  uppercase?: boolean;
  /** Adds a soft shadow so text stays legible over busy imagery. */
  onImage?: boolean;
}

export function Text({ variant = 'body', color = 'text', center, uppercase, onImage, style, ...rest }: Props) {
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
        onImage && {
          textShadowColor: 'rgba(0,0,0,0.55)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 8,
        },
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({});
