"""Consent endpoints. Every grant/withdrawal is appended to the ledger; nothing
is ever mutated. Withdrawal is as easy as granting (compliance skill §1)."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import ConsentEvent, ConsentPurpose

router = APIRouter(prefix="/consent", tags=["consent"])

CURRENT_NOTICE_VERSION = "2026-06-21"


class ConsentIn(BaseModel):
    user_id: str
    purpose: ConsentPurpose
    granted: bool


@router.post("")
def set_consent(body: ConsentIn, db: Session = Depends(get_db)):
    evt = ConsentEvent(
        user_id=body.user_id,
        purpose=body.purpose,
        granted=body.granted,
        notice_version=CURRENT_NOTICE_VERSION,
    )
    db.add(evt)
    db.commit()
    return {"ok": True, "purpose": body.purpose, "granted": body.granted}


@router.get("/{user_id}")
def current_consents(user_id: str, db: Session = Depends(get_db)):
    """Latest state per purpose, derived from the append-only ledger."""
    events = (
        db.query(ConsentEvent)
        .filter(ConsentEvent.user_id == user_id)
        .order_by(ConsentEvent.created_at.asc())
        .all()
    )
    state: dict[str, bool] = {}
    for e in events:
        state[e.purpose.value] = e.granted
    return {"user_id": user_id, "consents": state}
