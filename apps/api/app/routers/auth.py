"""
Auth endpoints — first-party signup/login with email + phone + password.

- Passwords are bcrypt-hashed (app.core.security), never stored in plaintext.
- 18+ is enforced at signup from `dob`.
- Login accepts email OR phone + password.
- A JWT access token is returned; the mobile app stores it in expo-secure-store.
- Signup logs the required `account_core` consent to the append-only ledger.
- Google sign-in is planned (auth_provider column already supports it).
"""
from typing import Optional
import re
from datetime import date

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.db import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models import User, ConsentEvent, ConsentPurpose

router = APIRouter(prefix="/auth", tags=["auth"])

CURRENT_NOTICE_VERSION = "2026-06-21"
GOOGLE_ISSUERS = ("accounts.google.com", "https://accounts.google.com")
PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


def _normalize_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None
    p = re.sub(r"[\s\-()]", "", phone)
    if not PHONE_RE.match(p):
        raise HTTPException(status_code=422, detail="Invalid phone number")
    return p


def _is_adult(dob_iso: str) -> bool:
    try:
        y, m, d = (int(x) for x in dob_iso.split("-"))
        born = date(y, m, d)
    except (ValueError, TypeError):
        raise HTTPException(status_code=422, detail="Invalid date of birth (YYYY-MM-DD)")
    today = date.today()
    age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    return age >= 18


class SignupIn(BaseModel):
    email: EmailStr
    phone: str
    password: str
    dob: str  # YYYY-MM-DD

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginIn(BaseModel):
    identifier: str  # email or phone
    password: str


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


def _issue(user: User) -> AuthOut:
    return AuthOut(access_token=create_access_token(user.id), user_id=user.id, email=user.email)


@router.post("/signup", response_model=AuthOut, status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    if not _is_adult(body.dob):
        raise HTTPException(status_code=403, detail="You must be 18 or older to join")
    phone = _normalize_phone(body.phone)

    email = body.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    if phone and db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=409, detail="An account with this phone already exists")

    user = User(
        email=email,
        phone=phone,
        password_hash=hash_password(body.password),
        auth_provider="password",
        dob=body.dob,
    )
    db.add(user)
    db.flush()  # get user.id before logging consent

    # Required consent for core account processing → append-only ledger.
    db.add(ConsentEvent(
        user_id=user.id,
        purpose=ConsentPurpose.account_core,
        granted=True,
        notice_version=CURRENT_NOTICE_VERSION,
        method="signup",
    ))
    db.commit()
    db.refresh(user)
    return _issue(user)


@router.post("/login", response_model=AuthOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    ident = body.identifier.strip()
    q = db.query(User)
    if "@" in ident:
        user = q.filter(User.email == ident.lower()).first()
    else:
        user = q.filter(User.phone == _normalize_phone(ident)).first()

    # Constant-ish response: same error whether user missing or password wrong.
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")
    return _issue(user)


# --------------------------------------------------------------------------- #
# Google Sign-In                                                              #
#                                                                             #
# The mobile app runs the Google OAuth flow and sends us the resulting        #
# credential. We VERIFY it server-side (the client is untrusted) and only     #
# then create/lookup the user and issue OUR jwt. We accept an id_token        #
# (preferred) or an access_token, and require the token's audience to match   #
# one of our configured Google client IDs so a token minted for another app   #
# can't be replayed here.                                                     #
# --------------------------------------------------------------------------- #
class GoogleIn(BaseModel):
    id_token: Optional[str] = None
    access_token: Optional[str] = None
    dob: Optional[str] = None  # required only when creating a NEW Google account (18+ gate)


def _allowed_google_aud() -> set[str]:
    return {c for c in (
        settings.google_web_client_id,
        settings.google_ios_client_id,
        settings.google_android_client_id,
    ) if c}


def _verify_google(body: GoogleIn) -> dict:
    """Verify a Google credential and return {sub, email, email_verified}."""
    allowed = _allowed_google_aud()
    if not allowed:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on the server")

    if body.id_token:
        try:
            info = google_id_token.verify_oauth2_token(body.id_token, google_requests.Request())
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        if info.get("iss") not in GOOGLE_ISSUERS:
            raise HTTPException(status_code=401, detail="Invalid Google token issuer")
        if info.get("aud") not in allowed:
            raise HTTPException(status_code=401, detail="Google token was not issued for this app")
        return {"sub": info["sub"], "email": (info.get("email") or "").lower(), "email_verified": bool(info.get("email_verified"))}

    if body.access_token:
        try:
            with httpx.Client(timeout=10) as c:
                res = c.get("https://oauth2.googleapis.com/tokeninfo", params={"access_token": body.access_token})
            res.raise_for_status()
            data = res.json()
        except Exception:
            raise HTTPException(status_code=401, detail="Could not verify Google token")
        if (data.get("aud") or data.get("azp")) not in allowed:
            raise HTTPException(status_code=401, detail="Google token was not issued for this app")
        return {"sub": data["sub"], "email": (data.get("email") or "").lower(), "email_verified": str(data.get("email_verified")).lower() == "true"}

    raise HTTPException(status_code=422, detail="Provide a Google id_token or access_token")


@router.post("/google", response_model=AuthOut)
def google_auth(body: GoogleIn, db: Session = Depends(get_db)):
    ident = _verify_google(body)
    sub, email = ident["sub"], ident["email"]
    if not email or not ident["email_verified"]:
        raise HTTPException(status_code=403, detail="Your Google email must be verified")

    user = db.query(User).filter((User.google_sub == sub) | (User.email == email)).first()
    if user:
        if not user.is_active:
            raise HTTPException(status_code=403, detail="This account has been deactivated")
        if not user.google_sub:  # link Google to an existing (e.g. password) account
            user.google_sub = sub
            db.commit()
            db.refresh(user)
        return _issue(user)

    # New account — Google doesn't give us DOB, so the 18+ gate needs it from the client.
    if not body.dob:
        raise HTTPException(status_code=422, detail="dob_required")
    if not _is_adult(body.dob):
        raise HTTPException(status_code=403, detail="You must be 18 or older to join")

    user = User(email=email, auth_provider="google", google_sub=sub, dob=body.dob, password_hash=None)
    db.add(user)
    db.flush()
    db.add(ConsentEvent(
        user_id=user.id,
        purpose=ConsentPurpose.account_core,
        granted=True,
        notice_version=CURRENT_NOTICE_VERSION,
        method="google_oauth",
    ))
    db.commit()
    db.refresh(user)
    return _issue(user)
