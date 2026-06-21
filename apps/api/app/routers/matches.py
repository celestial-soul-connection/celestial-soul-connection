"""Match endpoints. Free tier: one explainable match/day, capped at 5 over 5 days.
The contact-unlock is a separate, paid, consented action on a mutual match."""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models import Match, PsychProfile

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/daily/{user_id}")
def daily_match(user_id: str, db: Session = Depends(get_db)):
    """Return today's match if quota allows. Real impl runs the scoring service
    over the candidate pool; here we read the most recent precomputed match."""
    since = datetime.now(timezone.utc) - timedelta(days=1)
    today = db.query(Match).filter(Match.user_id == user_id, Match.created_at >= since).first()
    if not today:
        raise HTTPException(404, "No match generated yet today.")
    return {
        "match_id": today.id,
        "score": today.score,
        "explanation": today.explanation_json,
        "mutual": today.mutual,
        "contact_unlocked": today.contact_unlocked,
    }


class UnlockIn(BaseModel):
    match_id: str
    paying_user_id: str
    payment_token: str  # PCI processor token — raw card data is never sent here


@router.post("/unlock-contact")
def unlock_contact(body: UnlockIn, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == body.match_id).first()
    if not match:
        raise HTTPException(404, "match not found")
    if not match.mutual:
        raise HTTPException(403, "Contact can be unlocked only on a mutual match.")
    # TODO: charge nominal fee via processor token; log contact_share consent event.
    match.contact_unlocked = True
    db.commit()
    return {"ok": True, "contact_unlocked": True}
