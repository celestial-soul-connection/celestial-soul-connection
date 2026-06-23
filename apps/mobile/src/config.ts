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
export const API_BASE_URL = 'http://localhost:8000';
export const API_TIMEOUT_MS = 15000;

// Google Sign-In OAuth client IDs (from Google Cloud Console → Credentials).
// These are PUBLIC identifiers (safe to ship) — the secret lives only on the
// server. Paste yours here (see docs/google-oauth-setup.md). The platform the
// app runs on decides which ID is used:
//   - Expo Go / web  → webClientId (also the audience the backend verifies)
//   - native iOS      → iosClientId
//   - native Android  → androidClientId
export const GOOGLE_OAUTH = {
  webClientId: '400808248934-60ku1gavf25o7mbnbib07kqu4jgdjdu1.apps.googleusercontent.com',
  iosClientId: '400808248934-8idon6opqbqnjms8hemi3lb7c2iof6qa.apps.googleusercontent.com',
  androidClientId: '', // optional — add when you build for Android
};

/** True once the client IDs you need have been pasted in (gates the Google
 *  button). Empty strings are fine (a platform you're not targeting yet); only
 *  the leftover `YOUR_…` placeholders count as "not configured". */
export const GOOGLE_OAUTH_CONFIGURED = !Object.values(GOOGLE_OAUTH).some((v) => v.startsWith('YOUR_'));
