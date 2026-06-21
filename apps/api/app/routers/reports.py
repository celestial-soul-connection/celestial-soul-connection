"""Reporting & offboarding. Any user can report; reports are auditable; offboarding
a defaulter logs reason + actor and deactivates rather than hard-deleting evidence
needed for safety (compliance skill §2)."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import Report, User, AccessLog

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportIn(BaseModel):
    reporter_id: str
    reported_id: str
    reason: str
    detail: str | None = None


@router.post("")
def create_report(body: ReportIn, db: Session = Depends(get_db)):
    rep = Report(**body.model_dump())
    db.add(rep)
    db.commit()
    return {"ok": True, "report_id": rep.id, "status": rep.status}


class OffboardIn(BaseModel):
    actor_id: str        # moderator
    reported_id: str
    reason: str


@router.post("/offboard")
def offboard(body: OffboardIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == body.reported_id).first()
    if not user:
        raise HTTPException(404, "user not found")
    user.is_active = False
    db.add(AccessLog(actor_id=body.actor_id, subject_id=body.reported_id,
                     action="offboard", resource=f"user:{body.reason}"))
    db.commit()
    return {"ok": True, "offboarded": body.reported_id}
