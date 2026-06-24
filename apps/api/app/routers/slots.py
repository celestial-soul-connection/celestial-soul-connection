"""
Connection slots — the server side of the "one curated soul at a time" model
that today lives in the mobile `slots.ts` mock.

A user holds a fixed number of slots; a curated candidate is delivered into an
open slot; opt-in opens the connection (active); decline frees the slot and the
pair is forward-only (never re-suggested). Deliveries are capped per rolling week.

NOTE: candidate selection/ranking is delegated to the matching service (TODO) —
this router manages slot STATE + caps, not the ranking itself.
"""
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import User, ConnectionSlot

router = APIRouter(prefix="/slots", tags=["slots"])

# TODO: derive from gender/plan (PRD: man 1 slot, woman 2). Scaffold defaults:
DEFAULT_SLOT_COUNT = 2
WEEKLY_DELIVERY_CAP = 2


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_slots(db: Session, user: User) -> list[ConnectionSlot]:
    slots = db.query(ConnectionSlot).filter(ConnectionSlot.user_id == user.id).all()
    missing = DEFAULT_SLOT_COUNT - len(slots)
    for _ in range(max(0, missing)):
        s = ConnectionSlot(user_id=user.id, state="open")
        db.add(s)
        slots.append(s)
    if missing > 0:
        db.flush()
    return slots


def _view(db: Session, user: User) -> dict:
    slots = _ensure_slots(db, user)
    week_ago = _now() - timedelta(days=7)
    deliveries = db.query(ConnectionSlot).filter(
        ConnectionSlot.user_id == user.id,
        ConnectionSlot.candidate_id.isnot(None),
        ConnectionSlot.updated_at >= week_ago,
    ).count()
    open_count = sum(1 for s in slots if s.state == "open")
    can_receive = open_count > 0 and deliveries < WEEKLY_DELIVERY_CAP
    return {
        "slots": [{"id": s.id, "state": s.state, "candidateId": s.candidate_id} for s in slots],
        "openCount": open_count,
        "deliveriesThisWeek": deliveries,
        "deliveryCap": WEEKLY_DELIVERY_CAP,
        "canReceiveDelivery": can_receive,
    }


@router.get("")
def get_slots(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    v = _view(db, user)
    db.commit()
    return v


class CandidateIn(BaseModel):
    candidate_id: str


@router.post("/deliver")
def deliver(body: CandidateIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    view = _view(db, user)
    if not view["canReceiveDelivery"]:
        raise HTTPException(409, "No open slot or weekly delivery cap reached")
    slot = db.query(ConnectionSlot).filter(ConnectionSlot.user_id == user.id, ConnectionSlot.state == "open").first()
    slot.candidate_id = body.candidate_id
    slot.state = "candidate_pending"
    slot.updated_at = _now()
    db.commit()
    return {"ok": True}


@router.post("/optin")
def optin(body: CandidateIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    slot = db.query(ConnectionSlot).filter(
        ConnectionSlot.user_id == user.id, ConnectionSlot.candidate_id == body.candidate_id
    ).first()
    if not slot:
        raise HTTPException(404, "No slot holds that candidate")
    # TODO: open the reciprocal connection on the candidate's side + create a Match.
    slot.state = "active"
    slot.updated_at = _now()
    db.commit()
    return {"ok": True, "state": "active"}


@router.post("/decline")
def decline(body: CandidateIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    slot = db.query(ConnectionSlot).filter(
        ConnectionSlot.user_id == user.id, ConnectionSlot.candidate_id == body.candidate_id
    ).first()
    if not slot:
        raise HTTPException(404, "No slot holds that candidate")
    # TODO: persist the declined pair so it's never re-suggested (forward-only).
    slot.candidate_id = None
    slot.state = "open"
    slot.updated_at = _now()
    db.commit()
    return {"ok": True, "state": "open"}
