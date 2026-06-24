"""
Billing — store-based subscriptions (Apple IAP / Google Play Billing), replacing
the mobile `billing.ts` mock. Store rules require digital subscriptions to go
through the platform billing, NOT a card processor — so the client buys via the
store SDK and sends us the RECEIPT, which we VERIFY server-side and persist as a
Subscription. A 7-day free trial runs from account creation.

NOTE: real receipt verification (Apple verifyReceipt / App Store Server API,
Google Play Developer API) and store webhooks are marked TODO — the shapes here
are production-ready; the provider calls slot into `_verify_receipt`.
"""
from typing import Optional
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models import User, Subscription, ConsentEvent, ConsentPurpose

router = APIRouter(prefix="/billing", tags=["billing"])

TRIAL_DAYS = 7
NOTICE_VERSION = "2026-06-21"

PRODUCTS = [
    {"id": "weekly_99", "label": "Aligned", "price": 99, "currency": "INR", "period": "week",
     "apple_product_id": "com.csc.app.aligned.weekly", "google_product_id": "aligned_weekly"},
    {"id": "weekly_199", "label": "Aligned+", "price": 199, "currency": "INR", "period": "week",
     "apple_product_id": "com.csc.app.alignedplus.weekly", "google_product_id": "alignedplus_weekly"},
]
_PRODUCT_IDS = {p["id"] for p in PRODUCTS}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _entitlement(db: Session, user: User) -> dict:
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id, Subscription.status == "active")
        .order_by(Subscription.updated_at.desc())
        .first()
    )
    active_sub = bool(sub and (sub.expires_at is None or sub.expires_at > _now()))

    trial_end = (user.created_at or _now()) + timedelta(days=TRIAL_DAYS)
    in_trial = not active_sub and _now() < trial_end
    trial_days_left = max(0, (trial_end - _now()).days) if in_trial else 0

    return {
        "isPremium": active_sub or in_trial,
        "subscription": ({"plan_id": sub.plan_id, "store": sub.store, "expires_at": sub.expires_at.isoformat() if sub.expires_at else None} if active_sub else None),
        "inTrial": in_trial,
        "trialDaysLeft": trial_days_left,
    }


@router.get("/products")
def products():
    return PRODUCTS


@router.get("/entitlement")
def entitlement(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _entitlement(db, user)


class VerifyIn(BaseModel):
    store: str            # apple | google
    product_id: str       # one of PRODUCTS[].id
    receipt: str          # store receipt / purchase token
    transaction_id: Optional[str] = None


def _verify_receipt(store: str, receipt: str) -> dict:
    """Verify a store receipt with Apple/Google and return {valid, expires_at}.
    TODO: implement Apple App Store Server API + Google Play Developer API calls.
    Scaffold: accept a non-empty receipt and grant one weekly period."""
    if not receipt:
        return {"valid": False, "expires_at": None}
    return {"valid": True, "expires_at": _now() + timedelta(days=7)}


@router.post("/verify")
def verify(body: VerifyIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.store not in ("apple", "google"):
        raise HTTPException(422, "store must be 'apple' or 'google'")
    if body.product_id not in _PRODUCT_IDS:
        raise HTTPException(422, "unknown product_id")

    result = _verify_receipt(body.store, body.receipt)
    if not result["valid"]:
        raise HTTPException(402, "Receipt could not be verified")

    sub = db.query(Subscription).filter(
        Subscription.user_id == user.id, Subscription.original_txn_id == body.transaction_id
    ).first() if body.transaction_id else None
    if not sub:
        sub = Subscription(user_id=user.id, original_txn_id=body.transaction_id)
        db.add(sub)
    sub.plan_id = body.product_id
    sub.store = body.store
    sub.status = "active"
    sub.in_trial = False
    sub.expires_at = result["expires_at"]
    sub.updated_at = _now()
    db.add(ConsentEvent(user_id=user.id, purpose=ConsentPurpose.account_core, granted=True, notice_version=NOTICE_VERSION, method="purchase"))
    db.commit()
    return _entitlement(db, user)


@router.post("/webhooks/store")
def store_webhook(payload: dict, db: Session = Depends(get_db)):
    """Apple/Google (or RevenueCat) server-to-server notifications: renewals,
    cancellations, refunds, billing retries. TODO: verify signature + map the
    event to the user's Subscription (renew → extend, refund → status=refunded)."""
    # TODO: authenticate the webhook + update Subscription by original_txn_id.
    return {"received": True}
