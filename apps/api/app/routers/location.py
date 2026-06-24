"""
Location endpoints — a server-side PROXY for place autocomplete + reverse
geocoding. The provider key lives only here (never shipped in the app) so we can
cache, rate-limit, and swap providers. Returns coarse, display-friendly data;
the client sends back only city/geohash to /me/location.

Default provider is Google Places/Geocoding; set `geocode_api_key` (+ optionally
`geocode_provider`) in the backend env. Without a key, endpoints return 503 so
the app can fall back gracefully.
"""
from typing import Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.config import settings
from app.core.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/location", tags=["location"])


@router.get("/places")
def places_search(q: str = Query(min_length=2), user: User = Depends(get_current_user)):
    """Autocomplete a place query → [{ description, place_id }]."""
    if not settings.geocode_api_key:
        raise HTTPException(503, "Location search is not configured on the server")
    try:
        with httpx.Client(timeout=8) as c:
            r = c.get(
                "https://maps.googleapis.com/maps/api/place/autocomplete/json",
                params={"input": q, "types": "(cities)", "key": settings.geocode_api_key},
            )
            r.raise_for_status()
            data = r.json()
    except Exception:
        raise HTTPException(502, "Place provider unavailable")
    return [
        {"description": p.get("description"), "place_id": p.get("place_id")}
        for p in data.get("predictions", [])
    ]


@router.get("/reverse")
def reverse_geocode(
    lat: float = Query(...),
    lng: float = Query(...),
    user: User = Depends(get_current_user),
):
    """Reverse geocode device GPS → a coarse { city, region, country }. We do NOT
    store the raw lat/lng — only the derived city is sent back and later saved."""
    if not settings.geocode_api_key:
        raise HTTPException(503, "Reverse geocoding is not configured on the server")
    try:
        with httpx.Client(timeout=8) as c:
            r = c.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={"latlng": f"{lat},{lng}", "result_type": "locality", "key": settings.geocode_api_key},
            )
            r.raise_for_status()
            data = r.json()
    except Exception:
        raise HTTPException(502, "Geocode provider unavailable")

    results = data.get("results", [])
    if not results:
        return {"city": None, "region": None, "country": None}

    def comp(types: str) -> Optional[str]:
        for c in results[0].get("address_components", []):
            if types in c.get("types", []):
                return c.get("long_name")
        return None

    return {"city": comp("locality"), "region": comp("administrative_area_level_1"), "country": comp("country")}
