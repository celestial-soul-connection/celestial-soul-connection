/**
 * tokens.ts — Theme-independent design primitives.
 *
 * Spacing, radii, typography, motion, and elevation are SHARED across all
 * palettes. Only colour changes between themes. This keeps spatial rhythm and
 * type scale identical no matter which palette is active — so the app always
 * "feels" like the same product.
 *
 * Type pairing: Playfair Display (expressive serif, headings) + Manrope
 * (grounded geometric sans, body). Distinctive, romantic-but-modern — not the
 * generic Inter/Roboto default.
 */

/* 8pt spacing scale — never hard-code raw pixel margins in components */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fontFamily = {
  display: 'PlayfairDisplay',       // headings, hero, "soul" moments
  displayItalic: 'PlayfairDisplay-Italic',
  body: 'Manrope',                  // body, UI
  bodyMedium: 'Manrope-Medium',
  bodyBold: 'Manrope-Bold',
} as const;

/**
 * Type scale. `font` maps to a fontFamily key; screens use <Text variant="...">
 * rather than ad-hoc fontSize so the scale stays consistent.
 */
export const typography = {
  displayXl: { font: 'display', size: 40, lineHeight: 46, letterSpacing: -0.5 },
  displayLg: { font: 'display', size: 30, lineHeight: 38, letterSpacing: -0.3 },
  headline:  { font: 'display', size: 22, lineHeight: 28, letterSpacing: -0.2 },
  title:     { font: 'bodyBold', size: 18, lineHeight: 24, letterSpacing: 0 },
  bodyLg:    { font: 'body', size: 16, lineHeight: 24, letterSpacing: 0 },
  body:      { font: 'body', size: 14, lineHeight: 21, letterSpacing: 0 },
  label:     { font: 'bodyMedium', size: 13, lineHeight: 18, letterSpacing: 0.4 },
  caption:   { font: 'body', size: 12, lineHeight: 16, letterSpacing: 0.6 },
  overline:  { font: 'bodyMedium', size: 11, lineHeight: 14, letterSpacing: 1.4 }, // UPPERCASE metadata
} as const;

export type TypographyVariant = keyof typeof typography;

/**
 * Motion — calm, intentional, never frantic. Durations in ms.
 * Use these for ALL animations so the app has one consistent "physics".
 */
export const motion = {
  duration: {
    instant: 120,
    fast: 220,
    base: 340,
    slow: 520,
    aura: 4200,   // ambient background pulse
  },
  /* react-native-reanimated easing config consumed via helpers */
  spring: {
    gentle: { damping: 18, stiffness: 140, mass: 1 },
    bouncy: { damping: 12, stiffness: 180, mass: 0.9 },
  },
  /* cubic-bezier control points for timing-based animation */
  easing: {
    standard: [0.4, 0.0, 0.2, 1] as const,
    decelerate: [0.0, 0.0, 0.2, 1] as const,
    accelerate: [0.4, 0.0, 1, 1] as const,
  },
} as const;

/** Soft, coloured elevation — shadows are tinted by the active glow, set per-theme. */
export const elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  sm: { shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 1, elevation: 3 },
  md: { shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, shadowOpacity: 1, elevation: 8 },
  lg: { shadowOffset: { width: 0, height: 20 }, shadowRadius: 40, shadowOpacity: 1, elevation: 16 },
} as const;
