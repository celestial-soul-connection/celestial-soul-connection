/**
 * GlassCard — frosted-glass surface (expo-blur) with a light 1px edge and soft
 * glow. The premium replacement for a plain Card when you want depth. Blur
 * intensity / tint / border / glow all read from feel.glass + feel.glow, so the
 * whole app's "glassiness" is tunable from one place.
 */
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  children: React.ReactNode;
  glow?: boolean;
  padded?: boolean;
  radius?: number;
  style?: ViewStyle;
}

export function GlassCard({ children, glow, padded = true, radius, style }: Props) {
  const t = useTheme();
  const r = radius ?? t.radii.xl;
  const tint = t.mode === 'dark' ? 'dark' : 'light';

  return (
    <View
      style={[
        {
          borderRadius: r,
          shadowColor: glow ? t.colors.primary : '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: glow ? t.feel.glow.radius : 18,
          shadowOpacity: glow ? t.feel.glow.opacity : t.mode === 'dark' ? 0.4 : 0.12,
          elevation: glow ? 12 : 6,
        },
        style,
      ]}>
      <BlurView intensity={t.feel.glass.intensity} tint={tint} style={{ borderRadius: r, overflow: 'hidden' }}>
        <View
          style={{
            backgroundColor: hexToRgba(t.colors.bgElevated, t.feel.glass.tintOpacity),
            borderWidth: 1,
            borderColor: hexToRgba(t.mode === 'dark' ? '#FFFFFF' : t.colors.primary, t.feel.glass.borderOpacity),
            borderRadius: r,
            padding: padded ? t.spacing.xl : 0,
          }}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const styles = StyleSheet.create({});
