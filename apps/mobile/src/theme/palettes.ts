/**
 * palettes.ts — Single source of truth for ALL colour themes.
 *
 * RULE OF THE HOUSE: A "new feature" is NEVER allowed to introduce a new theme,
 * raw hex value, or one-off colour. Every screen reads from the SAME token
 * contract (`ThemeTokens`). To restyle the whole app you swap the active
 * theme/mode — you never touch component code.
 *
 * FOUR themes ship, each with an independent LIGHT and DARK mode (8 token sets):
 *   - midnightViolet (default · cosmic)   - roseGold (warm)
 *   - deepTeal (calm)                      - obsidianGold (luxe)
 * These are the locked design-revamp themes ("Soul Print + Star Sync").
 * Adding a theme = implement the SAME `ThemeTokens` keys for BOTH modes.
 */

export type ThemeName = 'midnightViolet' | 'roseGold' | 'deepTeal' | 'obsidianGold';

export type ThemeMode = 'light' | 'dark';

/**
 * The token contract. Every palette MUST provide every key, in every mode.
 * Components reference tokens by ROLE (e.g. `colors.primary`), never by hue.
 */
export interface ThemeTokens {
  name: ThemeName;
  label: string;
  mode: ThemeMode;
  colors: {
    /* Surfaces — back-to-front layering */
    bg: string;            // app background  (mockup --bg0)
    bgElevated: string;    // cards / sheets
    bgSunken: string;      // wells, inputs
    overlay: string;       // scrim behind modals (rgba)
    glass: string;         // glassmorphism surface fill (mockup --glass)

    /* Content */
    text: string;          // primary text  (mockup --ink)
    textMuted: string;     // secondary text (mockup --muted)
    textFaint: string;     // captions / metadata (mockup --faint)
    textOnPrimary: string; // text sitting on `primary`
    textOnAccent: string;  // text sitting on `accent`
    textOnImage: string;       // text over photos / dark scrims (always light)
    textOnImageMuted: string;  // secondary text over photos

    /* Brand */
    primary: string;       // main brand action (mockup --violet, the brand hue)
    primaryHover: string;
    primarySoft: string;   // tinted primary surface (chips, badges)
    accent: string;        // warm spark / secondary highlight (mockup --rose)
    accentSoft: string;
    highlight: string;     // celestial gold — "Star Sync" / score / sacred accent (mockup --gold)

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
    border: string;        // mockup --line
    borderStrong: string;
    glow: string;          // ambient aura glow (rgba)
  };
  /* Two-stop gradients keyed by role, consumed by <Gradient/> */
  gradients: {
    brand: [string, string];   // primary CTA gradient (mockup --grad)
    aura: [string, string];
    match: [string, string];   // high-compatibility celebratory
    nebula: [string, string, string]; // atmospheric background blobs (mockup --n1/--n2/--n3)
  };
}

/* Helper: build both modes of a theme from the mockup's CSS-var values. */
function theme(
  name: ThemeName,
  label: string,
  dark: ThemeTokens['colors'] & { grad: [string, string]; nebula: [string, string, string] },
  light: ThemeTokens['colors'] & { grad: [string, string]; nebula: [string, string, string] },
): { dark: ThemeTokens; light: ThemeTokens } {
  const make = (mode: ThemeMode, c: typeof dark): ThemeTokens => {
    const { grad, nebula, ...colors } = c;
    return {
      name,
      label,
      mode,
      colors,
      gradients: {
        brand: grad,
        aura: [colors.primarySoft, colors.bg],
        match: [colors.highlight, colors.primary],
        nebula,
      },
    };
  };
  return { dark: make('dark', dark), light: make('light', light) };
}

/* ------------------------------------------------------------------ */
/* 1. MIDNIGHT VIOLET (DEFAULT · cosmic)                               */
/* ------------------------------------------------------------------ */
const midnightViolet = theme(
  'midnightViolet',
  'Midnight Violet',
  {
    bg: '#070414', bgElevated: '#1A1236', bgSunken: '#0E0922', overlay: 'rgba(5,4,15,0.6)',
    glass: 'rgba(26,18,54,0.46)',
    text: '#F3EEFF', textMuted: '#A89BD0', textFaint: '#695E92',
    textOnPrimary: '#1A1430', textOnAccent: '#2A1230', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#A98BFF', primaryHover: '#B79CFF', primarySoft: '#2A2350',
    accent: '#E985B0', accentSoft: '#3A1F2E', highlight: '#E7C766',
    success: '#5FD3A8', warning: '#E7C766', danger: '#FF8FA0', dangerSoft: '#3A1F2A',
    heat0: '#4A4170', heat1: '#8E78C8', heat2: '#B58BF0', heat3: '#E7C766',
    border: 'rgba(168,150,255,0.20)', borderStrong: 'rgba(168,150,255,0.36)', glow: 'rgba(168,150,255,0.22)',
    grad: ['#B79CFF', '#4B2FA0'], nebula: ['#6E4FE0', '#C0407A', '#2E7E78'],
  },
  {
    bg: '#F4F0FB', bgElevated: '#FFFFFF', bgSunken: '#ECE6F7', overlay: 'rgba(36,27,51,0.42)',
    glass: 'rgba(255,255,255,0.62)',
    text: '#241B33', textMuted: '#6E6184', textFaint: '#9F94B3',
    textOnPrimary: '#FFFFFF', textOnAccent: '#FFFFFF', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#7E5FD6', primaryHover: '#6E4FD0', primarySoft: '#EAE2FB',
    accent: '#C75D90', accentSoft: '#F7E2EE', highlight: '#B98E1E',
    success: '#2E9E8E', warning: '#B98E1E', danger: '#D9445C', dangerSoft: '#FBE0E4',
    heat0: '#D9CFF2', heat1: '#B49BE6', heat2: '#8E6FD6', heat3: '#B98E1E',
    border: 'rgba(126,95,214,0.18)', borderStrong: 'rgba(126,95,214,0.32)', glow: 'rgba(126,95,214,0.16)',
    grad: ['#9A7BEF', '#4B2FA0'], nebula: ['#B79CFF', '#E985B0', '#7FD6C8'],
  },
);

/* ------------------------------------------------------------------ */
/* 2. ROSE GOLD (warm)                                                 */
/* ------------------------------------------------------------------ */
const roseGold = theme(
  'roseGold',
  'Rose Gold',
  {
    bg: '#15080C', bgElevated: '#361622', bgSunken: '#1F0C12', overlay: 'rgba(15,5,8,0.6)',
    glass: 'rgba(54,22,34,0.46)',
    text: '#FCEAEF', textMuted: '#D0A2B0', textFaint: '#925E6E',
    textOnPrimary: '#3A0E1A', textOnAccent: '#3A1C08', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#FF6F91', primaryHover: '#FF8FB0', primarySoft: '#4A1F2C',
    accent: '#F2A65A', accentSoft: '#3A2614', highlight: '#F0C46A',
    success: '#5FD3A8', warning: '#F0C46A', danger: '#FF8FA0', dangerSoft: '#4A1F28',
    heat0: '#6E3A4A', heat1: '#C85D7A', heat2: '#FF6F91', heat3: '#F0C46A',
    border: 'rgba(255,150,180,0.20)', borderStrong: 'rgba(255,150,180,0.36)', glow: 'rgba(255,111,145,0.22)',
    grad: ['#FFA9C2', '#A8284E'], nebula: ['#E8567F', '#F0A24B', '#B83A6A'],
  },
  {
    bg: '#FFF4F2', bgElevated: '#FFFFFF', bgSunken: '#FBE6E4', overlay: 'rgba(58,24,34,0.42)',
    glass: 'rgba(255,255,255,0.66)',
    text: '#3A1822', textMuted: '#9A6675', textFaint: '#C098A4',
    textOnPrimary: '#FFFFFF', textOnAccent: '#3A1C08', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#E04A78', primaryHover: '#C0335C', primarySoft: '#FBDDE6',
    accent: '#D88A3A', accentSoft: '#FBEAD6', highlight: '#C0922A',
    success: '#2E9E8E', warning: '#C0922A', danger: '#D9445C', dangerSoft: '#FBE0E4',
    heat0: '#F2CDD8', heat1: '#EC97AE', heat2: '#E04A78', heat3: '#C0922A',
    border: 'rgba(224,74,120,0.16)', borderStrong: 'rgba(224,74,120,0.30)', glow: 'rgba(224,74,120,0.16)',
    grad: ['#FF9DBA', '#C0335C'], nebula: ['#FFA9C2', '#F0C46A', '#F08AA8'],
  },
);

/* ------------------------------------------------------------------ */
/* 3. DEEP TEAL (calm)                                                 */
/* ------------------------------------------------------------------ */
const deepTeal = theme(
  'deepTeal',
  'Deep Teal',
  {
    bg: '#04110F', bgElevated: '#0C2826', bgSunken: '#081917', overlay: 'rgba(3,12,11,0.6)',
    glass: 'rgba(12,40,38,0.46)',
    text: '#E6FBF5', textMuted: '#8FC6BC', textFaint: '#4E7E76',
    textOnPrimary: '#04211C', textOnAccent: '#2A1C05', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#62E6D0', primaryHover: '#6BE6CF', primarySoft: '#0E3A36',
    accent: '#56C8E8', accentSoft: '#0E2E3A', highlight: '#E7C766',
    success: '#62E6D0', warning: '#E7C766', danger: '#FF8FA0', dangerSoft: '#3A1F2A',
    heat0: '#2E5E58', heat1: '#3FA391', heat2: '#62E6D0', heat3: '#E7C766',
    border: 'rgba(91,224,196,0.20)', borderStrong: 'rgba(91,224,196,0.36)', glow: 'rgba(98,230,208,0.22)',
    grad: ['#6BE6CF', '#0E5E55'], nebula: ['#1FA391', '#2E6E9E', '#3FC9C0'],
  },
  {
    bg: '#EEF8F5', bgElevated: '#FFFFFF', bgSunken: '#E0F0EC', overlay: 'rgba(14,42,38,0.42)',
    glass: 'rgba(255,255,255,0.64)',
    text: '#0E2A26', textMuted: '#4E817A', textFaint: '#86AEA8',
    textOnPrimary: '#FFFFFF', textOnAccent: '#2A1C05', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#159E8B', primaryHover: '#0C6E62', primarySoft: '#D2EFEA',
    accent: '#2E8EAE', accentSoft: '#D6ECF2', highlight: '#B98E1E',
    success: '#159E8B', warning: '#B98E1E', danger: '#D9445C', dangerSoft: '#FBE0E4',
    heat0: '#C9E6E1', heat1: '#7FCEC1', heat2: '#159E8B', heat3: '#B98E1E',
    border: 'rgba(31,163,145,0.16)', borderStrong: 'rgba(31,163,145,0.30)', glow: 'rgba(31,163,145,0.16)',
    grad: ['#4FD0BA', '#0C6E62'], nebula: ['#6BE6CF', '#56C8E8', '#8FE0D4'],
  },
);

/* ------------------------------------------------------------------ */
/* 4. OBSIDIAN GOLD (luxe)                                             */
/* ------------------------------------------------------------------ */
const obsidianGold = theme(
  'obsidianGold',
  'Obsidian Gold',
  {
    bg: '#0B0A07', bgElevated: '#221E14', bgSunken: '#13110B', overlay: 'rgba(7,6,3,0.6)',
    glass: 'rgba(34,30,20,0.5)',
    text: '#F6F0E2', textMuted: '#BCB199', textFaint: '#7A715C',
    textOnPrimary: '#2A2008', textOnAccent: '#2A2008', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#D9B45A', primaryHover: '#F0D584', primarySoft: '#3A3015',
    accent: '#E0A24B', accentSoft: '#3A2E14', highlight: '#E7C766',
    success: '#5FD3A8', warning: '#E7C766', danger: '#FF8FA0', dangerSoft: '#3A1F2A',
    heat0: '#5E5436', heat1: '#A8902E', heat2: '#D9B45A', heat3: '#E7C766',
    border: 'rgba(231,199,102,0.20)', borderStrong: 'rgba(231,199,102,0.36)', glow: 'rgba(231,199,102,0.22)',
    grad: ['#F0D584', '#9C7C26'], nebula: ['#9C7C26', '#6E5E3A', '#C9A227'],
  },
  {
    bg: '#FAF6EC', bgElevated: '#FFFFFF', bgSunken: '#F2EAD6', overlay: 'rgba(42,36,16,0.42)',
    glass: 'rgba(255,255,255,0.66)',
    text: '#2A2410', textMuted: '#7A715C', textFaint: '#A89E84',
    textOnPrimary: '#FFFFFF', textOnAccent: '#2A2008', textOnImage: '#FFFFFF', textOnImageMuted: 'rgba(255,255,255,0.82)',
    primary: '#B8902E', primaryHover: '#8E6E1E', primarySoft: '#F2E6C4',
    accent: '#C0922A', accentSoft: '#F2E6C4', highlight: '#9C7C26',
    success: '#2E9E8E', warning: '#9C7C26', danger: '#D9445C', dangerSoft: '#FBE0E4',
    heat0: '#E6D9B0', heat1: '#CBB46E', heat2: '#B8902E', heat3: '#9C7C26',
    border: 'rgba(184,144,46,0.18)', borderStrong: 'rgba(184,144,46,0.32)', glow: 'rgba(184,144,46,0.16)',
    grad: ['#E0C168', '#8E6E1E'], nebula: ['#E0C168', '#C9A227', '#D9B45A'],
  },
);

/** All token sets, keyed by [theme][mode]. */
export const PALETTES: Record<ThemeName, Record<ThemeMode, ThemeTokens>> = {
  midnightViolet,
  roseGold,
  deepTeal,
  obsidianGold,
};

export const THEME_ORDER: ThemeName[] = ['midnightViolet', 'roseGold', 'deepTeal', 'obsidianGold'];

export const DEFAULT_THEME: ThemeName = 'midnightViolet';
export const DEFAULT_MODE: ThemeMode = 'dark';

/** Resolve the active token set for a (theme, mode) pair. */
export function resolvePalette(name: ThemeName, mode: ThemeMode): ThemeTokens {
  return PALETTES[name][mode];
}
