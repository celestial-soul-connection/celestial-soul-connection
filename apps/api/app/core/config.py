"""App configuration. Secrets come from env — never hard-code keys."""
from pydantic import field_validator
from pydantic_settings import BaseSettings

_SQLITE_DEV = "sqlite:///./csc_dev.db"


class Settings(BaseSettings):
    app_name: str = "Celestial Soul Connection API"
    # Persistence: Supabase Postgres in prod (use the connection-pooling URI).
    # Local dev defaults to SQLite so the app runs with zero setup.
    database_url: str = "sqlite:///./csc_dev.db"
    # 32-byte urlsafe base64 key for field-level encryption of sensitive data.
    # MUST be set from a secrets manager in prod; dev default is insecure on purpose.
    field_encryption_key: str = "dev-insecure-change-me-32bytes-key-base64=="
    jwt_secret: str = "dev-jwt-secret-change-me"
    jwt_alg: str = "HS256"
    # Free tier: at most one match/day, capped at 5 total over the first 5 days.
    free_daily_matches: int = 1
    free_total_matches: int = 5
    data_region: str = "ap-south-1"  # India residency by default

    # Upstream astrology engine (the existing astral-knowledge API). We consume
    # its kundli/synastry endpoints instead of recomputing astrology here.
    astro_api_base_url: str = "http://localhost:8000"
    astro_api_key: str = ""

    # Google Sign-In: the OAuth client IDs that may MINT id_tokens for our app.
    # We accept tokens whose `aud` matches ANY configured client (web for Expo Go /
    # web, ios/android for native builds). Set from env; never commit real values.
    google_web_client_id: str = ""
    google_ios_client_id: str = ""
    google_android_client_id: str = ""

    # Location: server-side key for places autocomplete + reverse geocoding. Kept
    # on the server (never shipped in the app) so it can be cached + rate-limited.
    geocode_provider: str = "google"        # google | mapbox | nominatim
    geocode_api_key: str = ""

    # Supabase. `database_url` above carries the Postgres connection; these are for
    # Supabase Storage (photo uploads) via the service-role key, and — only if we
    # later accept Supabase-Auth-issued JWTs — the JWT secret.
    supabase_url: str = ""                  # https://<ref>.supabase.co
    supabase_publishable_key: str = ""      # sb_publishable_... — public (replaces legacy anon)
    supabase_secret_key: str = ""           # 🔒 sb_secret_... — server only (replaces service_role)
    supabase_jwt_secret: str = ""           # legacy only; new projects verify via JWKS
    supabase_storage_bucket: str = "photos"

    @field_validator("database_url")
    @classmethod
    def _db_default(cls, v: str) -> str:
        # A blank DATABASE_URL (placeholder until Supabase is filled) → SQLite dev.
        return v.strip() or _SQLITE_DEV

    class Config:
        env_file = ".env"
        extra = "ignore"   # .env also holds keys for Supabase/Edge Functions/stores


settings = Settings()
