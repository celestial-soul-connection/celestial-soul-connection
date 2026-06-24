#!/usr/bin/env python3
"""
Apply supabase/migrations/*.sql in filename order, recording each in
public.schema_migrations so we know exactly what ran (and never re-run it).

Reads DATABASE_URL from the environment, or falls back to apps/api/.env.
Run with the backend venv (it has sqlalchemy + psycopg2):

    apps/api/.venv/bin/python supabase/apply.py
"""
import os
import sys
import pathlib
from sqlalchemy import create_engine

ROOT = pathlib.Path(__file__).resolve().parent
MIGRATIONS = ROOT / "migrations"


def database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    env = ROOT.parent / "apps" / "api" / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                return line.split("=", 1)[1].strip()
    sys.exit("No DATABASE_URL in env or apps/api/.env")


def main() -> None:
    engine = create_engine(database_url(), pool_pre_ping=True)
    with engine.begin() as c:
        c.exec_driver_sql(
            "create table if not exists public.schema_migrations "
            "(version text primary key, applied_at timestamptz not null default now())"
        )
    with engine.connect() as c:
        done = {r[0] for r in c.exec_driver_sql("select version from public.schema_migrations")}

    applied = []
    for f in sorted(MIGRATIONS.glob("*.sql")):
        if f.name in done:
            print(f"  skip (already applied): {f.name}")
            continue
        sql = f.read_text()
        try:
            with engine.begin() as c:
                c.exec_driver_sql(sql)
                c.exec_driver_sql(
                    "insert into public.schema_migrations(version) values (%(v)s)", {"v": f.name}
                )
            print(f"  ✓ applied: {f.name}")
            applied.append(f.name)
        except Exception as ex:  # noqa: BLE001
            print(f"  ✗ FAILED: {f.name}\n    {type(ex).__name__}: {str(ex)[:500]}")
            sys.exit(1)

    print("done. newly applied:", applied or "(nothing new)")


if __name__ == "__main__":
    main()
