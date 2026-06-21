/**
 * Root layout — loads brand fonts, wraps the app in ThemeProvider + safe area,
 * and configures the navigation stack. The status bar follows the active theme mode.
 */
import 'react-native-gesture-handler'; // must be the first import for gestures
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { FONT_ASSETS } from '../src/theme/fonts';
import { ensureTrialStarted } from '../src/data/billing';

function StatusBarThemed() {
  const t = useTheme();
  return <StatusBar style={t.mode === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts(FONT_ASSETS);
  useEffect(() => {
    if (error) console.warn('Font load error (add .ttf files to assets/fonts):', error);
  }, [error]);

  // Start the 7-day free trial clock on first launch (idempotent).
  useEffect(() => { ensureTrialStarted(); }, []);

  // Keep splash until fonts load; allow render on error so dev isn't blocked.
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBarThemed />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/phone" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="onboarding/birth-portal" />
            <Stack.Screen name="onboarding/questionnaire" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="match/daily" />
            <Stack.Screen name="match/celebration" options={{ animation: 'fade', presentation: 'transparentModal' }} />
            <Stack.Screen name="match/chat" />
            <Stack.Screen name="match/[id]/report" />
            <Stack.Screen name="profile/me" />
            <Stack.Screen name="profile/[id]" />
            <Stack.Screen name="settings/theme" />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          </Stack>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
