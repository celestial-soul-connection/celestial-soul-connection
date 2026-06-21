/**
 * ThemeProvider — exposes the active theme to the whole app and persists the
 * user's palette choice. Components consume it via `useTheme()`.
 *
 * This is the ONLY place the active palette is chosen. Swapping themes is a
 * one-line state change; no component knows or cares which palette is live.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES, DEFAULT_THEME, ThemeName, ThemeTokens } from './palettes';
import { spacing, radii, typography, fontFamily, motion, elevation } from './tokens';
import { FEELS, ACTIVE_FEEL, Feel } from './feel';

const STORAGE_KEY = '@csc/theme';

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
  available: { name: ThemeName; label: string; mode: string }[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function compose(name: ThemeName): Theme {
  return { ...PALETTES[name], spacing, radii, typography, fontFamily, motion, elevation, feel: FEELS[ACTIVE_FEEL] };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && saved in PALETTES) setThemeName(saved as ThemeName);
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: compose(themeName),
      themeName,
      setTheme,
      available: Object.values(PALETTES).map((p) => ({ name: p.name, label: p.label, mode: p.mode })),
    }),
    [themeName, setTheme],
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
