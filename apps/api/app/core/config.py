"""App configuration. Secrets come from env — never hard-code keys."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Celestial Soul Connection API"
    database_url: str = "sqlite:///./csc_dev.db"  # swap to Postgres in prod
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

    class Config:
        env_file = ".env"


settings = Settings()
