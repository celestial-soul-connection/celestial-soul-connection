"""Chat endpoints. Messages are scanned for contact info, redacted, encrypted,
then stored. Requires chat_processing consent (enforced in production middleware)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.crypto import encrypt
from app.models import Message, Match
from app.services.contact_filter import scan

router = APIRouter(prefix="/chat", tags=["chat"])


class MessageIn(BaseModel):
    match_id: str
    sender_id: str
    body: str


@router.post("/send")
def send(body: MessageIn, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == body.match_id).first()
    if not match:
        raise HTTPException(404, "match not found")

    redacted_text, was_redacted = scan(body.body)
    msg = Message(
        match_id=body.match_id,
        sender_id=body.sender_id,
        body_enc=encrypt(redacted_text),
        redacted=was_redacted,
    )
    db.add(msg)
    db.commit()
    return {
        "ok": True,
        "redacted": was_redacted,
        "notice": "Contact details unlock only via a confirmed mutual match." if was_redacted else None,
    }
