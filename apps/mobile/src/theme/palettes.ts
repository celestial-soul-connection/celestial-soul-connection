/**
 * palettes.ts — Single source of truth for ALL colour themes.
 *
 * RULE OF THE HOUSE: A "new feature" is NEVER allowed to introduce a new theme,
 * raw hex value, or one-off colour. Every screen reads from the SAME token
 * contract (`ThemeTokens`). To restyle the whole app you swap the active
 * palette — you never touch component code.
 *
 * Three palettes ship. Default = "warmDusk". Users can switch in Settings.
 * Adding a palette = implement the SAME `ThemeTokens` keys. Nothing else changes.
 */

export type ThemeName = 'warmDusk' | 'cosmicTwilight' | 'sunriseTeal';

export type ThemeMode = 'light' | 'dark';

/**
 * The token contract. Every palette MUST provide every key.
 * Components reference tokens by ROLE (e.g. `colors.primary`), never by hue.
 */
export interface ThemeTokens {
  name: ThemeName;
  label: string;
  mode: ThemeMode;
  colors: {
    /* Surfaces — back-to-front layering */
    bg: string;            // app background
    bgElevated: string;    // cards / sheets
    bgSunken: string;      // wells, inputs
    overlay: string;       // scrim behind modals (rgba)

    /* Content */
    text: string;          // primary text
    textMuted: string;     // secondary text
    textFaint: string;     // captions / metadata
    textOnPrimary: string; // text sitting on `primary`
    textOnAccent: string;  // text sitting on `accent`
    textOnImage: string;       // text over photos / dark scrims (always light)
    textOnImageMuted: string;  // secondary text over photos

    /* Brand */
    primary: string;       // main brand action
    primaryHover: string;
    primarySoft: string;   // tinted primary surface (chips, badges)
    accent: string;        // warm spark / highlight
    accentSoft: string;

    /* Feedback */
    success: string;
    warning: string;
    danger: string;        // also used for "report"/destructive
    dangerSoft: string;

    /* Compatibility heat scale (low -> high alignment) */
    heat0: string;
    heat1: string;
    heat2: string;
    heat3: string;

    /* Lines & glows */
    border: string;
    borderStrong: string;
    glow: string;          // ambient aura glow (rgba)
  };
  /* Two-stop gradients keyed by role, consumed by <Gradient/> */
  gradients: {
    brand: [string, string];
    aura: [string, string];
    match: [string, string];   // high-compatibility celebratory
  };
}

/* ------------------------------------------------------------------ */
/* 1. WARM DUSK ROMANCE  (DEFAULT) — blush/rose + coral on warm cream  */
/* ------------------------------------------------------------------ */
const warmDusk: ThemeTokens = {
  name: 'warmDusk',
  label: 'Warm Dusk',
  mode: 'light',
  colors: {
    bg: '#FFF6F2',
    bgElevated: '#FFFFFF',
    bgSunken: '#FBEBE4',
    overlay: 'rgba(45, 27, 46, 0.45)',

    text: '#2D1B2E',
    textMuted: '#6E5662',
    textFaint: '#A18B95',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#3A1E14',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.82)',

    primary: '#E8607A',
    primaryHover: '#D44A66',
    primarySoft: '#FCE0E6',
    accent: '#FF8A65',
    accentSoft: '#FFE2D6',

    success: '#3FA98A',
    warning: '#E8A23D',
    danger: '#D9445C',
    dangerSoft: '#FBE0E4',

    heat0: '#E7C9CF',
    heat1: '#F0A2AE',
    heat2: '#EC6F86',
    heat3: '#E8607A',

    border: '#F2D9DC',
    borderStrong: '#E9BFC6',
    glow: 'rgba(232, 96, 122, 0.18)',
  },
  gradients: {
    brand: ['#E8607A', '#FF8A65'],
    aura: ['#FFE2D6', '#FCE0E6'],
    match: ['#FF8A65', '#E8607A'],
  },
};

/* ------------------------------------------------------------------ */
/* 2. COSMIC TWILIGHT — deep indigo night + warm gold + lavender glow  */
/* ------------------------------------------------------------------ */
const cosmicTwilight: ThemeTokens = {
  name: 'cosmicTwilight',
  label: 'Cosmic Twilight',
  mode: 'dark',
  colors: {
    bg: '#14122B',
    bgElevated: '#1E1B3A',
    bgSunken: '#0E0C20',
    overlay: 'rgba(5, 4, 15, 0.6)',

    text: '#ECE8FF',
    textMuted: '#B3ABD6',
    textFaint: '#7E769E',
    textOnPrimary: '#1A1430',
    textOnAccent: '#2A1C05',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.82)',

    primary: '#C9A2FF',
    primaryHover: '#B488FF',
    primarySoft: '#2A2350',
    accent: '#F4C77B',
    accentSoft: '#3A2F1A',

    success: '#5FD3A8',
    warning: '#F4C77B',
    danger: '#FF8FA0',
    dangerSoft: '#3A1F2A',

    heat0: '#4A4170',
    heat1: '#8E78C8',
    heat2: '#B58BF0',
    heat3: '#F4C77B',

    border: '#2D2A4D',
    borderStrong: '#3D3963',
    glow: 'rgba(201, 162, 255, 0.22)',
  },
  gradients: {
    brand: ['#C9A2FF', '#8E78C8'],
    aura: ['#2A2350', '#14122B'],
    match: ['#F4C77B', '#C9A2FF'],
  },
};

/* ------------------------------------------------------------------ */
/* 3. SUNRISE TEAL & PEACH — fresh, Gen-Z, "new beginning"             */
/* ------------------------------------------------------------------ */
const sunriseTeal: ThemeTokens = {
  name: 'sunriseTeal',
  label: 'Sunrise',
  mode: 'light',
  colors: {
    bg: '#FFFBF5',
    bgElevated: '#FFFFFF',
    bgSunken: '#F1F6F2',
    overlay: 'rgba(31, 58, 56, 0.42)',

    text: '#1F3A38',
    textMuted: '#557570',
    textFaint: '#94ADA8',
    textOnPrimary: '#FFFFFF',
    textOnAccent: '#3A2014',
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.82)',

    primary: '#2DB5A8',
    primaryHover: '#1F9A8E',
    primarySoft: '#D7F0EC',
    accent: '#FF9E7A',
    accentSoft: '#FFE4D8',

    success: '#2DB5A8',
    warning: '#F2A93B',
    danger: '#E36A5A',
    dangerSoft: '#FBE2DD',

    heat0: '#C9E6E1',
    heat1: '#8FD6CB',
    heat2: '#54C4B4',
    heat3: '#2DB5A8',

    border: '#DCEAE6',
    borderStrong: '#C4DDD7',
    glow: 'rgba(45, 181, 168, 0.18)',
  },
  gradients: {
    brand: ['#2DB5A8', '#54C4B4'],
    aura: ['#D7F0EC', '#FFE4D8'],
    match: ['#FF9E7A', '#2DB5A8'],
  },
};

export const PALETTES: Record<ThemeName, ThemeTokens> = {
  warmDusk,
  cosmicTwilight,
  sunriseTeal,
};

export const DEFAULT_THEME: ThemeName = 'warmDusk';
