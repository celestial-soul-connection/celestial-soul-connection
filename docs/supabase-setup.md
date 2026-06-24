# Supabase as the persistence layer

Architecture: **FastAPI keeps all server logic; Supabase provides Postgres + Storage.**
We do NOT move auth/consent/encryption/matching to the client — those must run on
trusted server code. Supabase is the database (and file storage), not the app logic.

## What to create in Supabase
1. **Create a project** — pick region **`ap-south-1` (Mumbai)** for India/DPDP residency.
2. **Storage** → create a **bucket** named `photos` (keep it **private**; we issue
   signed URLs from the server). Optionally a `kyc` bucket (private, stricter).
3. (Later, if we adopt Supabase Auth) enable the **Google** + **Apple** providers.

## What to send me (or put in `apps/api/.env`)
From **Project Settings → Database → Connection pooling** (mode: *Transaction*):
- **`DATABASE_URL`** — the pooled URI, rewritten to the SQLAlchemy driver:
  ```
  postgresql+psycopg2://postgres.<ref>:<DB-PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
  ```
  (Take Supabase's "Connection pooling" string and change the scheme to
  `postgresql+psycopg2://`. Use port **6543**, not 5432.)

From **Project Settings → API**:
- **`SUPABASE_URL`** — `https://<ref>.supabase.co`
- **`SUPABASE_ANON_KEY`** — public anon key (safe on client)
- **`SUPABASE_SERVICE_ROLE_KEY`** — ⚠️ secret, server‑only (Storage admin)
- **`SUPABASE_JWT_SECRET`** — only needed if we validate Supabase‑Auth tokens

> The **anon key is public**; the **service‑role key and DB password are secrets** —
> send those privately / put them straight into `.env` (gitignored), not chat.

## Code already wired
- `core/db.py` reads `DATABASE_URL` and adds `pool_pre_ping` + `pool_recycle`
  (needed behind Supabase's PgBouncer pooler).
- `requirements.txt` adds `psycopg2-binary` (Postgres driver) + `supabase` (Storage).
- `core/config.py` exposes the Supabase settings above.

## Schema / migrations
- Dev currently uses `Base.metadata.create_all` (auto-creates tables). Against
  Supabase, that works for a first cut, but adopt **Alembic** migrations before
  launch (the models changed: `Profile`, `Subscription`, `ConnectionSlot`, plus
  location/push/profile fields on `users`).
- To bootstrap the schema on Supabase quickly: point `DATABASE_URL` at Supabase and
  start the API once — `create_all` builds the tables. (Then switch to Alembic.)

## Still to build once creds land
- `/me/photos` upload: return a **signed upload URL** from the `photos` bucket
  (service-role key) so the app uploads directly to Supabase Storage; we store the
  resulting path on `users.photo_url` / `profiles.photos_json`.
- Optional: Row-Level Security policies if any table is ever read directly by the
  client (not needed while everything goes through FastAPI).

## Open decision (tell me)
Keep **our FastAPI auth** (email/phone/password + the Google OAuth we just merged),
or switch to **Supabase Auth** (it natively handles Google/Apple sign‑in, sessions,
refresh)? Recommendation: keep our auth for now — you just built it and it carries
the consent-logging — and use Supabase purely for Postgres + Storage.
