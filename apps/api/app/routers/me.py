"""
Current-user endpoints — the authenticated profile surface that replaces the
mobile app's local `store`/`session` mocks.

- All routes require a valid Bearer JWT (get_current_user).
- Sensitive birth data is field-level encrypted (crypto) and its writes are
  access-logged.
- Location is stored COARSE only (city/geohash), gated behind the
  `location_matching` consent purpose (logged to the append-only ledger).
"""
from typing import Optional
import json
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.crypto import encrypt
from app.models import User, Profile, PsychProfile, ConsentEvent, ConsentPurpose, AccessLog

router = APIRouter(prefix="/me", tags=["me"])
NOTICE_VERSION = "2026-06-21"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _profile(db: Session, user: User) -> Profile:
    p = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not p:
        p = Profile(user_id=user.id)
        db.add(p)
        db.flush()
    return p


# --------------------------------------------------------------------------- #
@router.get("")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = _profile(db, user)
    db.commit()
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "auth_provider": user.auth_provider,
        "dob": user.dob,
        "is_verified": user.is_verified,
        "name": user.display_name,
        "bio": user.bio,
        "photo_url": user.photo_url,
        "city": user.city,
        "interests": json.loads(p.interests_json or "[]"),
        "intentions": json.loads(p.intentions_json or "{}"),
        "photos": json.loads(p.photos_json or "[]"),
    }


class ProfileIn(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    photos: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    intentions: Optional[dict] = None


@router.put("/profile")
def update_profile(body: ProfileIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = _profile(db, user)
    if body.name is not None:
        user.display_name = body.name
    if body.bio is not None:
        user.bio = body.bio
    if body.photos is not None:
        p.photos_json = json.dumps(body.photos[:6])
        user.photo_url = body.photos[0] if body.photos else None
    if body.interests is not None:
        p.interests_json = json.dumps(body.interests[:10])
    if body.intentions is not None:
        p.intentions_json = json.dumps(body.intentions)
    p.updated_at = _now()
    db.commit()
    return {"ok": True}


class BirthIn(BaseModel):
    dob: str            # YYYY-MM-DD
    time: Optional[str] = None
    place: Optional[str] = None


@router.post("/birth")
def set_birth(body: BirthIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 18+ gate (also enforced at signup for password users; OAuth users land here).
    try:
        y, m, d = (int(x) for x in body.dob.split("-"))
        born = date(y, m, d)
    except (ValueError, TypeError):
        raise HTTPException(422, "Invalid date of birth (YYYY-MM-DD)")
    today = date.today()
    age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    if age < 18:
        raise HTTPException(403, "You must be 18 or older")

    user.dob = body.dob
    user.birth_time_enc = encrypt(body.time) if body.time else None
    user.birth_place_enc = encrypt(body.place) if body.place else None
    db.add(AccessLog(actor_id=user.id, subject_id=user.id, action="write", resource="birth_data"))
    db.add(ConsentEvent(user_id=user.id, purpose=ConsentPurpose.birth_data_matching, granted=True, notice_version=NOTICE_VERSION, method="onboarding"))
    db.commit()
    return {"ok": True, "age": age}


class PsychIn(BaseModel):
    attachment_secure: float = 0.0
    attachment_anxious: float = 0.0
    attachment_avoidant: float = 0.0
    values: Optional[dict] = None
    big_five: Optional[dict] = None
    conflict_style: Optional[str] = None
    self_expansion: float = 0.0
    dealbreakers: Optional[list[str]] = None


@router.post("/psych")
def set_psych(body: PsychIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(PsychProfile).filter(PsychProfile.user_id == user.id).first()
    if not p:
        p = PsychProfile(user_id=user.id)
        db.add(p)
    p.attachment_secure = body.attachment_secure
    p.attachment_anxious = body.attachment_anxious
    p.attachment_avoidant = body.attachment_avoidant
    p.values_json = json.dumps(body.values or {})
    p.big_five_json = json.dumps(body.big_five or {})
    p.conflict_style = body.conflict_style
    p.self_expansion = body.self_expansion
    p.dealbreakers_json = json.dumps(body.dealbreakers or [])
    p.updated_at = _now()
    db.add(ConsentEvent(user_id=user.id, purpose=ConsentPurpose.psychometric_profiling, granted=True, notice_version=NOTICE_VERSION, method="questionnaire"))
    db.commit()
    return {"ok": True}


class LocationIn(BaseModel):
    city: Optional[str] = None
    geohash: Optional[str] = None     # coarse cell (e.g. geohash precision 5) — NOT raw lat/lng


@router.post("/location")
def set_location(body: LocationIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # We deliberately accept only coarse location. The client derives city/geohash
    # from GPS on-device; we never persist raw precise coordinates.
    user.city = body.city
    user.geohash = body.geohash
    user.location_updated_at = _now()
    db.add(ConsentEvent(user_id=user.id, purpose=ConsentPurpose.location_matching, granted=True, notice_version=NOTICE_VERSION, method="app_toggle"))
    db.commit()
    return {"ok": True}


class PushIn(BaseModel):
    expo_push_token: str


@router.post("/push-token")
def set_push_token(body: PushIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.expo_push_token = body.expo_push_token
    db.commit()
    return {"ok": True}
