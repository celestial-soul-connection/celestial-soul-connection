/**
 * feel.ts — the "premium feel" token layer.
 *
 * WHY THIS EXISTS: the user wants a top-class, cinematic aesthetic that is ALSO
 * easy to change later. So we don't hard-code effect values into components.
 * Instead every premium effect (glow, blur, grain, scrim, particles, parallax,
 * motion reveal) reads its parameters from the ACTIVE FEEL PRESET here.
 *
 * To try a different vibe later, you change ONE thing: `ACTIVE_FEEL` (or add a
 * new preset implementing the `Feel` shape). No screen or component edits needed.
 * This is the same discipline as palettes.ts — but for *motion & atmosphere*.
 *
 * Colours still come from the palette tokens (useTheme); feel only controls the
 * INTENSITY and CHARACTER of effects, so it composes with all 3 palettes.
 */

export type FeelName = 'cinematic' | 'glassLuxe' | 'editorial' | 'minimal';

export interface Feel {
  name: FeelName;
  label: string;

  /** Background atmosphere */
  starfield: {
    enabled: boolean;
    count: number;        // number of stars/particles
    drift: number;        // px of slow drift
    twinkle: boolean;
    maxSize: number;      // px
  };
  mesh: {
    enabled: boolean;     // animated gradient mesh blobs behind content
    blobCount: number;
    blur: number;         // px blur on blobs
    opacity: number;      // 0..1
    driftDuration: number;// ms for one breathe cycle
  };
  grain: {
    enabled: boolean;
    opacity: number;      // 0..1, very low — adds filmic richness
  };

  /** Glass surfaces (expo-blur) */
  glass: {
    intensity: number;    // BlurView intensity 0..100
    tintOpacity: number;  // overlay tint opacity on glass
    borderOpacity: number;// 1px light edge opacity
  };

  /** Photographic heroes */
  hero: {
    scrimOpacity: number; // bottom gradient scrim over photos (legibility)
    parallax: number;     // px of parallax travel on scroll/tilt
    kenBurns: boolean;    // slow scale drift on hero images
    kenBurnsScale: number;
  };

  /** Glow / bloom around key elements */
  glow: {
    radius: number;       // shadowRadius
    opacity: number;      // shadow opacity
    pulse: boolean;       // breathing glow on hero CTAs / match
  };

  /** Motion character — "refined & purposeful" by default */
  motion: {
    revealStagger: number;  // ms between staggered children on screen enter
    revealTravel: number;   // px upward travel on entrance
    pressScale: number;     // tactile press scale (0.94..0.98)
    haptics: boolean;       // expo-haptics on key taps
    celebrate: boolean;     // run the big match-celebration animation
  };
}

/* -------------------------------------------------------------------------- */
/* CINEMATIC & ETHEREAL — the starting vibe (user-selected).                   */
/* Rich, dreamy, alive; motion kept "refined & purposeful", not frantic.       */
/* -------------------------------------------------------------------------- */
const cinematic: Feel = {
  name: 'cinematic',
  label: 'Cinematic',
  starfield: { enabled: true, count: 46, drift: 14, twinkle: true, maxSize: 2.4 },
  mesh: { enabled: true, blobCount: 3, blur: 60, opacity: 0.55, driftDuration: 9000 },
  grain: { enabled: true, opacity: 0.05 },
  glass: { intensity: 34, tintOpacity: 0.28, borderOpacity: 0.18 },
  hero: { scrimOpacity: 0.82, parallax: 26, kenBurns: true, kenBurnsScale: 1.10 },
  glow: { radius: 34, opacity: 0.45, pulse: true },
  motion: { revealStagger: 90, revealTravel: 22, pressScale: 0.96, haptics: true, celebrate: true },
};

/* A few alternates so swapping is literally a one-word change later. */
const glassLuxe: Feel = {
  ...cinematic,
  name: 'glassLuxe', label: 'Glass Luxe',
  starfield: { ...cinematic.starfield, enabled: false },
  mesh: { ...cinematic.mesh, blobCount: 4, opacity: 0.7 },
  glass: { intensity: 50, tintOpacity: 0.22, borderOpacity: 0.28 },
  hero: { ...cinematic.hero, kenBurns: false, parallax: 14 },
};

const editorial: Feel = {
  ...cinematic,
  name: 'editorial', label: 'Editorial',
  starfield: { ...cinematic.starfield, enabled: false },
  mesh: { ...cinematic.mesh, enabled: false },
  grain: { enabled: true, opacity: 0.04 },
  glass: { intensity: 18, tintOpacity: 0.4, borderOpacity: 0.12 },
  hero: { scrimOpacity: 0.7, parallax: 10, kenBurns: false, kenBurnsScale: 1 },
  glow: { radius: 20, opacity: 0.25, pulse: false },
  motion: { revealStagger: 70, revealTravel: 16, pressScale: 0.97, haptics: true, celebrate: true },
};

const minimal: Feel = {
  ...editorial,
  name: 'minimal', label: 'Minimal',
  grain: { enabled: false, opacity: 0 },
  glow: { radius: 12, opacity: 0.15, pulse: false },
  hero: { scrimOpacity: 0.6, parallax: 0, kenBurns: false, kenBurnsScale: 1 },
  motion: { revealStagger: 50, revealTravel: 10, pressScale: 0.98, haptics: false, celebrate: false },
};

export const FEELS: Record<FeelName, Feel> = { cinematic, glassLuxe, editorial, minimal };

/**
 * THE ONE KNOB. Change this to restyle the app's whole atmosphere.
 * (Later we can wire this to a Settings toggle just like the palette switcher.)
 */
export const ACTIVE_FEEL: FeelName = 'cinematic';
