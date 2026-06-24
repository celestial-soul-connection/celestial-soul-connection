"""
Celestial Soul Connection API.

Privacy-first by construction: sensitive fields encrypted at rest, an append-only
consent ledger + access log, chat contact-filtering, explainable psychology-based
matching, and full data-subject rights (export/delete). See:
  - docs/compliance/privacy-compliance-india-global.md
  - docs/research/compatibility-psychology.md
"""
from fastapi import FastAPI

from app.core.db import Base, engine
from app.core.config import settings
from app.routers import auth, consent, chat, matches, reports, data_rights, me, location, slots, billing

# Dev convenience: create tables. Use Alembic migrations in production.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="0.1.0")

app.include_router(auth.router)
app.include_router(consent.router)
app.include_router(matches.router)
app.include_router(chat.router)
app.include_router(reports.router)
app.include_router(data_rights.router)
app.include_router(me.router)
app.include_router(location.router)
app.include_router(slots.router)
app.include_router(billing.router)


@app.get("/health")
def health():
    return {"status": "ok", "region": settings.data_region}
