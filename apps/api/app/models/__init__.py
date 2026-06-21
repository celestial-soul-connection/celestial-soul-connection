"""
Data models. Sensitive fields (birth details, chat body, KYC) are stored
ENCRYPTED via app.core.crypto — never in plaintext columns.

Two append-only audit tables back our compliance posture:
  - ConsentEvent : every consent grant/withdrawal (DPDP burden-of-proof).
  - AccessLog    : every read/write of sensitive data.
Never UPDATE or DELETE rows in these tables — only INSERT.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, Enum
from app.core.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ConsentPurpose(str, enum.Enum):
    """Canonical granular consent purposes. MUST stay in sync with the mobile
    onboarding screen. Never reuse a purpose for a new use — add a new one."""
    account_core = "account_core"                  # required
    birth_data_matching = "birth_data_matching"
    psychometric_profiling = "psychometric_profiling"
    photo_display_to_matches = "photo_display_to_matches"
    kyc_verification = "kyc_verification"
    location_matching = "location_matching"
    chat_processing = "chat_processing"
    contact_share = "contact_share"                # per-event, paid
    marketing_comms = "marketing_comms"            # default off
    product_analytics = "product_analytics"        # default off
    personalization = "personalization"            # default off
    research_aggregate = "research_aggregate"      # default off


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    dob = Column(String, nullable=False)           # ISO date; enforced 18+ at signup
    is_verified = Column(Boolean, default=False)   # KYC status (docs stored separately)
    intent_score = Column(Float, default=0.5)      # serious-intent signal (see psychology doc)
    is_active = Column(Boolean, default=True)      # false = offboarded defaulter
    created_at = Column(DateTime, default=_now)

    # Sensitive — stored encrypted (Fernet tokens), not plaintext.
    birth_time_enc = Column(String, nullable=True)
    birth_place_enc = Column(String, nullable=True)


class ConsentEvent(Base):
    """APPEND-ONLY ledger. One row per grant/withdrawal. Burden of proof on us."""
    __tablename__ = "consent_events"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    purpose = Column(Enum(ConsentPurpose), nullable=False)
    granted = Column(Boolean, nullable=False)      # True=grant, False=withdrawal
    notice_version = Column(String, nullable=False)  # which privacy notice they saw
    method = Column(String, default="app_toggle")
    created_at = Column(DateTime, default=_now)


class PsychProfile(Base):
    """Research-backed compatibility dimensions (see compatibility-psychology.md)."""
    __tablename__ = "psych_profiles"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    attachment_secure = Column(Float, default=0.0)
    attachment_anxious = Column(Float, default=0.0)
    attachment_avoidant = Column(Float, default=0.0)
    values_json = Column(Text, default="{}")        # Schwartz values + life goals
    big_five_json = Column(Text, default="{}")
    conflict_style = Column(String, nullable=True)
    self_expansion = Column(Float, default=0.0)
    dealbreakers_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=_now)


class Match(Base):
    __tablename__ = "matches"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    candidate_id = Column(String, ForeignKey("users.id"))
    score = Column(Float, nullable=False)
    explanation_json = Column(Text, default="{}")   # explainable breakdown for the UI
    mutual = Column(Boolean, default=False)
    contact_unlocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_now)


class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=_uuid)
    match_id = Column(String, ForeignKey("matches.id"), index=True)
    sender_id = Column(String, ForeignKey("users.id"))
    body_enc = Column(String, nullable=False)       # encrypted at rest
    redacted = Column(Boolean, default=False)       # true if contact info was filtered
    created_at = Column(DateTime, default=_now)


class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=_uuid)
    reporter_id = Column(String, ForeignKey("users.id"))
    reported_id = Column(String, ForeignKey("users.id"), index=True)
    reason = Column(String, nullable=False)
    detail = Column(Text, nullable=True)
    status = Column(String, default="open")         # open | reviewed | actioned | dismissed
    created_at = Column(DateTime, default=_now)


class AccessLog(Base):
    """APPEND-ONLY. Every access to sensitive data, for audit/breach forensics."""
    __tablename__ = "access_logs"
    id = Column(String, primary_key=True, default=_uuid)
    actor_id = Column(String, nullable=True)        # user or internal staff id
    subject_id = Column(String, index=True)
    action = Column(String, nullable=False)         # read|write|export|delete
    resource = Column(String, nullable=False)
    created_at = Column(DateTime, default=_now)
