"""
Astrology upstream client.

We DO NOT compute astrology here. The existing astral-knowledge API already
provides birth charts (kundli), divisional charts, dasha, and marital/synastry
analysis. This app consumes those endpoints. That keeps the astro engine in one
place and lets this app focus on psychology-based matching + the product layer.

Contract (from astral-knowledge):
  - POST /kundli/complete        body: BirthDataRequest        (needs API key, feature "birth_chart")
  - POST /matching/stress-windows body: {person_a, person_b, ...}

BirthDataRequest = {date: "YYYY-MM-DD", time: "HH:MM", latitude, longitude, timezone, name?}

IMPORTANT (privacy-compliance §0,§4): birth details are SENSITIVE. We send them
to the upstream only with the user's `birth_data_matching` consent, over TLS, and
we never persist the raw chart payload beyond what matching needs.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Optional
import httpx

from app.core.config import settings


@dataclass
class BirthData:
    date: str          # YYYY-MM-DD
    time: str          # HH:MM (as precise as the user can give)
    latitude: float
    longitude: float
    timezone: str      # e.g. "Asia/Kolkata"
    name: Optional[str] = None

    def to_payload(self) -> dict[str, Any]:
        return {
            "date": self.date,
            "time": self.time,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": self.timezone,
            "name": self.name,
        }


class AstrologyClient:
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        # Configure via env: ASTRO_API_BASE_URL / ASTRO_API_KEY
        self.base_url = (base_url or getattr(settings, "astro_api_base_url", "http://localhost:8000")).rstrip("/")
        self.api_key = api_key or getattr(settings, "astro_api_key", "")

    def _headers(self) -> dict[str, str]:
        h = {"Content-Type": "application/json"}
        if self.api_key:
            h["X-API-Key"] = self.api_key  # adjust header name to upstream's auth scheme
        return h

    async def complete_kundli(self, birth: BirthData) -> dict[str, Any]:
        """Full birth chart + vargas + dasha for one person."""
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{self.base_url}/kundli/complete",
                json=birth.to_payload(),
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()

    async def marital_stress_windows(
        self, a: BirthData, b: BirthData, marriage_date: Optional[str] = None, horizon_years: int = 10
    ) -> dict[str, Any]:
        """Synastry / marital-compatibility windows between two people. This feeds
        the COSMETIC 'celestial' layer of the match card only — never the score."""
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{self.base_url}/matching/stress-windows",
                json={
                    "person_a": a.to_payload(),
                    "person_b": b.to_payload(),
                    "person_a_name": a.name,
                    "person_b_name": b.name,
                    "marriage_date": marriage_date,
                    "horizon_years": horizon_years,
                },
                headers=self._headers(),
            )
            r.raise_for_status()
            return r.json()


astrology = AstrologyClient()
