/**
 * CinematicBackground — the app's premium backdrop. As of the design revamp this
 * IS the "living sky": breathing nebula, twinkling stars, falling gold stardust,
 * and a bottom veil (see SkyBackground). Kept under this name so every existing
 * screen + ScreenFrame picks up the new look with no import changes.
 *
 * New screens should prefer <SkyScreen/> (adds safe-area + entrance), but this
 * remains the single composed atmosphere layer.
 */
import React from 'react';
import { ViewStyle } from 'react-native';
import { SkyBackground } from './SkyBackground';

export function CinematicBackground({ children, style }: { children?: React.ReactNode; style?: ViewStyle }) {
  return <SkyBackground style={style}>{children}</SkyBackground>;
}
