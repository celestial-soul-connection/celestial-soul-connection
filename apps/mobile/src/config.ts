/**
 * config.ts — single source for external service config + tunable weights.
 * Swap these for env-driven values when this moves to a real backend.
 */

// Karmian astrology API (place search + compatibility). Render free tier sleeps
// after ~15 min idle; clients here retry/wait + cache + fall back gracefully.
export const ASTRO_BASE_URL = 'https://karmgyan-api.onrender.com';
export const ASTRO_API_KEY = 'sk_test_astro_enterprise'; // test key; move to secrets for prod
export const PLACE_SEARCH_PATH = '/places/search';
export const COMPATIBILITY_PATH = '/compatibility/full';

// Fusion of psychology vs astrology into one score. Tunable; data is shown to the
// user so the blend stays honest. Start equal-weight (founder decision).
export const FUSION_WEIGHTS = { psych: 0.5, astro: 0.5 };

// Network resilience defaults for the sleeping Render API.
export const ASTRO_TIMEOUT_MS = 22000;
export const ASTRO_RETRIES = 1;

// Our own FastAPI backend (auth, profiles, matches). Override per environment.
// In dev, point at your machine's LAN IP so a physical phone can reach it, e.g.
// 'http://192.168.31.155:8000'. Localhost only works in a simulator.
// Per-build via EAS (eas.json `env.EXPO_PUBLIC_API_URL`); falls back to localhost
// for `expo start` dev. Android emulator reaches the host machine at 10.0.2.2;
// a physical device needs your LAN IP or a deployed HTTPS URL.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
export const API_TIMEOUT_MS = 15000;

// Google Sign-In OAuth client IDs (from Google Cloud Console → Credentials).
// These are PUBLIC identifiers (safe to ship) — the secret lives only on the
// server. Paste yours here (see docs/google-oauth-setup.md). The platform the
// app runs on decides which ID is used:
//   - Expo Go / web  → webClientId (also the audience the backend verifies)
//   - native iOS      → iosClientId
//   - native Android  → androidClientId
// All three MUST belong to the SAME Google Cloud project (currently 456432271911).
export const GOOGLE_OAUTH = {
  webClientId: '456432271911-kfm0jm01b2eafv5ekg41jntkssvjgepg.apps.googleusercontent.com',
  iosClientId: '', // create an iOS client in project 456432271911 when you build iOS
  androidClientId: '456432271911-ehcuu3srjok3lrkn8rh42l87qt65p610.apps.googleusercontent.com',
};

/** True once the client IDs you need have been pasted in (gates the Google
 *  button). Empty strings are fine (a platform you're not targeting yet); only
 *  the leftover `YOUR_…` placeholders count as "not configured". */
export const GOOGLE_OAUTH_CONFIGURED = !Object.values(GOOGLE_OAUTH).some((v) => v.startsWith('YOUR_'));
