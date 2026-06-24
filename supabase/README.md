# Supabase

The persistence layer (Postgres + RLS + Storage) for Celestial Soul Connection.

## migrations/
Numbered SQL files — the **source of truth** for the database schema. They are
**idempotent** (safe to re-run) and **tracked**: `apply.py` records each applied
file in `public.schema_migrations`, so we always know what ran.

- `0001_schema.sql` — tables + indexes + enable RLS
- `0002_policies.sql` — RLS policies (the security boundary) + helper fns
- `0003_auth_trigger.sql` — `handle_new_user` (profile + consent on signup) + `updated_at`
- `0004_storage.sql` — private `photos`/`kyc` buckets + owner-scoped object policies

**Add a change** = add a new `000N_*.sql` file (never edit an applied one), then apply.

## Applying
Uses the backend venv (has sqlalchemy + psycopg2) and reads `DATABASE_URL` from
`apps/api/.env`:

```bash
apps/api/.venv/bin/python supabase/apply.py
```

Or paste a file's contents into the Supabase dashboard → **SQL Editor** if you
prefer to run it by hand.

> Writes that are intentionally NOT allowed to end users (matches, messages,
> slots, subscriptions, access_logs) are performed by Edge Functions using the
> **secret** key, which bypasses RLS. That keeps matching, the chat
> contact-filter, billing verification, and the audit log server-trusted.
