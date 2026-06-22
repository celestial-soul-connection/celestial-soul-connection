"""
Auth endpoints — first-party signup/login with email + phone + password.

- Passwords are bcrypt-hashed (app.core.security), never stored in plaintext.
- 18+ is enforced at signup from `dob`.
- Login accepts email OR phone + password.
- A JWT access token is returned; the mobile app stores it in expo-secure-store.
- Signup logs the required `account_core` consent to the append-only ledger.
- Google sign-in is planned (auth_provider column already supports it).
"""
import re
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models import User, ConsentEvent, ConsentPurpose

router = APIRouter(prefix="/auth", tags=["auth"])

CURRENT_NOTICE_VERSION = "2026-06-21"
PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


def _normalize_phone(phone: str | None) -> str | None:
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
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")
    return _issue(user)
