/**
 * supabase.ts — the single Supabase client for the app.
 *
 * Uses the PUBLIC publishable key (real security is Row-Level Security on the
 * server). The session (tokens) persists in AsyncStorage and auto-refreshes
 * while the app is foregrounded.
 *
 * TODO(security): move the persisted session to an ENCRYPTED store
 * (SecureStore-backed) before launch — AsyncStorage is plaintext on the device.
 */
import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

if (!url || !publishableKey) {
  // Surfaces a clear message instead of a cryptic network error during dev.
  console.warn('Supabase env missing: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/mobile/.env');
}

export const supabase = createClient(url, publishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // we're native, not web redirect
  },
});

export const SUPABASE_CONFIGURED = !!url && !!publishableKey;

// Keep tokens fresh only while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
