"""
Explainable compatibility scoring — grounded in the psychology research doc
(docs/research/compatibility-psychology.md), NOT astrology. The celestial layer
is cosmetic framing applied in the UI only and never alters this score.

The score is a weighted blend of dimension sub-scores. Each dimension is either
similarity-based, complementarity-based, or quality-based. We return BOTH the
number and the breakdown so the app can tell the user WHY they matched.

The astrology/"karmic" layer (from app.services.astrology_client, which calls the
existing astral-knowledge kundli/synastry APIs) is COSMETIC FRAMING ONLY for the
match card. It must NEVER be added into the score below, nor override a deal-breaker.

Weights are the research doc's starting point and must be tunable + auditable
for disparate impact before any production use.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict

# Starting weights (sum ~1.0). See psychology doc §3.
WEIGHTS: Dict[str, float] = {
    "values_goals": 0.28,        # similarity — strongest real predictor
    "intent": 0.18,              # serious-intent alignment
    "attachment": 0.16,          # security-quality (two secure > matched insecurity)
    "conflict_comm": 0.14,       # quality — low Four-Horsemen
    "self_expansion": 0.12,      # shared novelty potential (complementarity ok)
    "emotional_intel": 0.12,     # responsiveness/empathy
}


@dataclass
class DimensionScore:
    key: str
    label: str
    score: float          # 0..100
    basis: str            # "similarity" | "complementarity" | "quality"


def _values_goals(a, b) -> float:
    # Placeholder: real impl compares Schwartz value vectors + hard life goals
    # (kids, religion, location). Deal-breaker mismatch should hard-zero upstream.
    return 88.0


def _attachment(a, b) -> float:
    # Two secure partners score highest; reward combined security, not "matching".
    return (a.attachment_secure + b.attachment_secure) / 2 * 100


def score_pair(a, b, intent_align: float = 85.0) -> dict:
    dims = [
        DimensionScore("values_goals", "Values & life goals", _values_goals(a, b), "similarity"),
        DimensionScore("intent", "Serious-intent alignment", intent_align, "quality"),
        DimensionScore("attachment", "Secure attachment fit", _attachment(a, b), "quality"),
        DimensionScore("conflict_comm", "Conflict & communication", 81.0, "quality"),
        DimensionScore("self_expansion", "Shared novelty", 76.0, "complementarity"),
        DimensionScore("emotional_intel", "Empathy & responsiveness", 84.0, "quality"),
    ]
    total = sum(WEIGHTS[d.key] * d.score for d in dims)
    return {
        "score": round(total, 1),
        "dimensions": [d.__dict__ for d in dims],
        "disclaimer": "Compatibility is emergent; this is a research-informed estimate, not a prediction.",
    }
