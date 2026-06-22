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
