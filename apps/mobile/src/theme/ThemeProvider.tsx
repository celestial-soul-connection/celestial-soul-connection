/**
 * ThemeProvider — exposes the active theme to the whole app and persists the
 * user's PALETTE and FEEL choices. Components consume it via `useTheme()`.
 *
 * Two independent live knobs:
 *   - palette (warmDusk / cosmicTwilight / sunriseTeal)  → colours
 *   - feel    (cinematic / glassLuxe / editorial / minimal) → atmosphere & motion
 * Both are switchable at runtime and persisted, so the look can be explored in
 * the app without touching code.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES, DEFAULT_THEME, ThemeName, ThemeTokens } from './palettes';
import { spacing, radii, typography, fontFamily, motion, elevation } from './tokens';
import { FEELS, ACTIVE_FEEL, Feel, FeelName } from './feel';

const PALETTE_KEY = '@csc/theme';
const FEEL_KEY = '@csc/feel';

export interface Theme extends ThemeTokens {
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  motion: typeof motion;
  elevation: typeof elevation;
  feel: Feel;
}

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  feelName: FeelName;
  setFeel: (name: FeelName) => void;
  available: { name: ThemeName; label: string; mode: string }[];
  availableFeels: { name: FeelName; label: string }[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function compose(name: ThemeName, feel: FeelName): Theme {
  return { ...PALETTES[name], spacing, radii, typography, fontFamily, motion, elevation, feel: FEELS[feel] };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [feelName, setFeelName] = useState<FeelName>(ACTIVE_FEEL);

  useEffect(() => {
    AsyncStorage.getItem(PALETTE_KEY).then((s) => { if (s && s in PALETTES) setThemeName(s as ThemeName); });
    AsyncStorage.getItem(FEEL_KEY).then((s) => { if (s && s in FEELS) setFeelName(s as FeelName); });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(PALETTE_KEY, name).catch(() => {});
  }, []);

  const setFeel = useCallback((name: FeelName) => {
    setFeelName(name);
    AsyncStorage.setItem(FEEL_KEY, name).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: compose(themeName, feelName),
      themeName,
      setTheme,
      feelName,
      setFeel,
      available: Object.values(PALETTES).map((p) => ({ name: p.name, label: p.label, mode: p.mode })),
      availableFeels: Object.values(FEELS).map((f) => ({ name: f.name, label: f.label })),
    }),
    [themeName, feelName, setTheme, setFeel],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within <ThemeProvider>');
  return ctx;
}
