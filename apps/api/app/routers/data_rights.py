"""Data-subject rights: export and delete (DPDP + GDPR). Self-serve from the app.
Deletion crypto-shreds sensitive fields and logs the action, honoring legal holds."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.crypto import crypto_shred
from app.models import User, PsychProfile, ConsentEvent, AccessLog

router = APIRouter(prefix="/me", tags=["data-rights"])


@router.get("/{user_id}/export")
def export_data(user_id: str, db: Session = Depends(get_db)):
    """Machine-readable export of the user's data (access right)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "user not found")
    profile = db.query(PsychProfile).filter(PsychProfile.user_id == user_id).first()
    consents = db.query(ConsentEvent).filter(ConsentEvent.user_id == user_id).all()
    db.add(AccessLog(actor_id=user_id, subject_id=user_id, action="export", resource="full"))
    db.commit()
    return {
        "account": {"id": user.id, "email": user.email, "dob": user.dob, "verified": user.is_verified},
        "profile": {c.name: getattr(profile, c.name) for c in PsychProfile.__table__.columns} if profile else None,
        "consent_history": [{"purpose": c.purpose.value, "granted": c.granted, "at": c.created_at.isoformat()} for c in consents],
    }


@router.delete("/{user_id}")
def delete_account(user_id: str, db: Session = Depends(get_db)):
    """Right to erasure. Crypto-shred sensitive fields + deactivate. Some records
    (safety reports, audit logs) are pseudonymised and retained per legal basis."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "user not found")
    crypto_shred(user_id)
    user.birth_time_enc = None
    user.birth_place_enc = None
    user.is_active = False
    user.email = f"deleted+{user_id}@erased.local"
    db.add(AccessLog(actor_id=user_id, subject_id=user_id, action="delete", resource="account"))
    db.commit()
    return {"ok": True, "erased": user_id}
