"""
Authentication primitives: password hashing (bcrypt) + JWT access tokens.

Passwords are NEVER stored or logged in plaintext, and NEVER reversibly
"encrypted" — only a one-way bcrypt hash is persisted (passlib handles the salt
and work factor). Tokens are short-lived HS256 JWTs signed with settings.jwt_secret
(which MUST come from a secrets manager in production).
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from .config import settings

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_TTL = timedelta(days=30)  # mobile session length; refresh later


def hash_password(plain: str) -> str:
    """One-way bcrypt hash (salted). Store this, never the plaintext."""
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _pwd.verify(plain, hashed)
    except ValueError:
        return False


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": user_id, "iat": now, "exp": now + ACCESS_TOKEN_TTL}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_alg)


def decode_access_token(token: str) -> Optional[str]:
    """Return the user id (sub) if the token is valid, else None."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_alg])
        return payload.get("sub")
    except JWTError:
        return None
