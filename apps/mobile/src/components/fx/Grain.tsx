/**
 * Grain — a faint film-grain overlay that adds filmic richness and stops large
 * gradient areas from looking flat/banded. Opacity from feel.grain. Pure SVG
 * fractal noise so it themes/scales without an asset.
 */
import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Filter, FeTurbulence, Rect } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

export function Grain() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  if (!t.feel.grain.enabled) return null;
  return (
    <Svg
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: t.feel.grain.opacity }]}
      width={width}
      height={height}>
      <Defs>
        <Filter id="grain">
          <FeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
        </Filter>
      </Defs>
      <Rect width={width} height={height} filter="url(#grain)" />
    </Svg>
  );
}
