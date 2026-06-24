"""
Database session/engine setup.

Persistence is Postgres in every environment except local dev (SQLite default).
For production we point `DATABASE_URL` at **Supabase Postgres**. Use Supabase's
*connection pooling* string (PgBouncer, host `...pooler.supabase.com`, port 6543,
transaction mode) for the app — it survives many short-lived connections. Example:

    postgresql+psycopg2://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require

`pool_pre_ping` recycles connections the pooler may have dropped. With PgBouncer
in transaction mode we let it own pooling and keep SQLAlchemy's pool small.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

_is_sqlite = settings.database_url.startswith("sqlite")

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    pool_pre_ping=not _is_sqlite,   # drop dead connections (important behind Supabase's pooler)
    pool_recycle=1800 if not _is_sqlite else -1,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
