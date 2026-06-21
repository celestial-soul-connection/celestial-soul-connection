/**
 * SkiaGlow — GPU-rendered ambient glow using react-native-skia for REAL blur.
 *
 * IMPORTANT: Skia is a native module that is NOT bundled in the standard Expo Go
 * app. To avoid crashing in Expo Go, we load it defensively: if the native module
 * isn't present, this renders nothing and the GradientMesh fallback still provides
 * atmosphere. Once you run a Development Build (npx expo run:ios / EAS), Skia loads
 * automatically and the richer glow appears — no code change needed.
 */
import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useTheme } from '../../theme/ThemeProvider';

// Expo Go does NOT ship Skia. Only attempt to load it in a Dev Build / standalone
// app, so Expo Go never even touches the native binding (which would crash).
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Skia: any = null;
if (!IS_EXPO_GO) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Skia = require('@shopify/react-native-skia');
  } catch {
    Skia = null;
  }
}

export function SkiaGlow() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();

  // No Skia (Expo Go) or feel has mesh off → render nothing; fallback handles it.
  if (!Skia || !Skia.Canvas || !t.feel.mesh.enabled) return null;

  const { Canvas, Circle, Blur, Group } = Skia;
  const a = t.gradients.brand[0];
  const b = t.gradients.match[0];
  const c = t.colors.accent;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Group opacity={t.feel.mesh.opacity}>
        <Blur blur={t.feel.mesh.blur} />
        <Circle cx={width * 0.2} cy={height * 0.18} r={150} color={a} />
        <Circle cx={width * 0.85} cy={height * 0.4} r={130} color={c} />
        <Circle cx={width * 0.5} cy={height * 0.9} r={170} color={b} />
      </Group>
    </Canvas>
  );
}
