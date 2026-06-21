"""
Field-level encryption for SENSITIVE data (birth details, chat, KYC, location).
Privacy-compliance skill §4 mandates encrypting these at rest. We use Fernet
(AES-128-CBC + HMAC). The key MUST come from a secrets manager in production.

`crypto_shred()` documents the deletion strategy: destroying the per-user data
key renders all that user's encrypted fields permanently unreadable.
"""
import base64
from cryptography.fernet import Fernet
from .config import settings


def _fernet() -> Fernet:
    # Accept a base64 key; derive a valid Fernet key deterministically for dev.
    raw = settings.field_encryption_key.encode()
    key = base64.urlsafe_b64encode(raw.ljust(32, b"0")[:32])
    return Fernet(key)


def encrypt(plaintext: str) -> str:
    if plaintext is None:
        return None
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt(token: str) -> str:
    if token is None:
        return None
    return _fernet().decrypt(token.encode()).decode()


def crypto_shred(user_id: str) -> None:
    """In prod: delete the user's per-record data key from the KMS so encrypted
    fields become unrecoverable. Stub here for the skeleton."""
    # TODO: integrate KMS per-user data keys; this is the deletion guarantee.
    return None
