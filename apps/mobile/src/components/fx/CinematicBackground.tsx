/**
 * CinematicBackground — the composed premium backdrop: base colour → drifting
 * gradient mesh → starfield → film grain. Everything it shows is governed by the
 * active feel preset, so changing ACTIVE_FEEL changes the whole atmosphere.
 *
 * Replaces the old flat AuraBackground. ScreenFrame uses this.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { GradientMesh } from './GradientMesh';
import { Starfield } from './Starfield';
import { Grain } from './Grain';

export function CinematicBackground({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }, style]}>
      <GradientMesh />
      <Starfield />
      <Grain />
      {children}
    </View>
  );
}
