/**
 * ThemeProvider — exposes the active theme to the whole app and persists the
 * user's THEME, MODE, and FEEL choices. Components consume it via `useTheme()`.
 *
 * Three independent live knobs:
 *   - theme (midnightViolet / roseGold / deepTeal / obsidianGold) → colour family
 *   - mode  (light / dark)                                        → light or dark
 *   - feel  (cinematic / glassLuxe / editorial / minimal)         → atmosphere & motion
 * All switchable at runtime and persisted, so the look can be explored in the
 * app without touching code.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PALETTES, THEME_ORDER, DEFAULT_THEME, DEFAULT_MODE, resolvePalette,
  ThemeName, ThemeMode, ThemeTokens,
} from './palettes';
import { spacing, radii, typography, fontFamily, motion, elevation } from './tokens';
import { FEELS, ACTIVE_FEEL, Feel, FeelName } from './feel';

const THEME_KEY = '@csc/theme';
const MODE_KEY = '@csc/mode';
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
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  feelName: FeelName;
  setFeel: (name: FeelName) => void;
  available: { name: ThemeName; label: string }[];
  availableFeels: { name: FeelName; label: string }[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function compose(name: ThemeName, mode: ThemeMode, feel: FeelName): Theme {
  return { ...resolvePalette(name, mode), spacing, radii, typography, fontFamily, motion, elevation, feel: FEELS[feel] };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [feelName, setFeelName] = useState<FeelName>(ACTIVE_FEEL);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((s) => { if (s && s in PALETTES) setThemeName(s as ThemeName); });
    AsyncStorage.getItem(MODE_KEY).then((s) => { if (s === 'light' || s === 'dark') setModeState(s); });
    AsyncStorage.getItem(FEEL_KEY).then((s) => { if (s && s in FEELS) setFeelName(s as FeelName); });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(THEME_KEY, name).catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const setFeel = useCallback((name: FeelName) => {
    setFeelName(name);
    AsyncStorage.setItem(FEEL_KEY, name).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: compose(themeName, mode, feelName),
      themeName,
      setTheme,
      mode,
      setMode,
      toggleMode,
      feelName,
      setFeel,
      available: THEME_ORDER.map((n) => ({ name: n, label: PALETTES[n].dark.label })),
      availableFeels: Object.values(FEELS).map((f) => ({ name: f.name, label: f.label })),
    }),
    [themeName, mode, feelName, setTheme, setMode, toggleMode, setFeel],
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
