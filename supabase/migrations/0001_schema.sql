-- 0001_schema.sql — core tables (Supabase Postgres).
-- Idempotent: safe to re-run. Users are owned by Supabase Auth (auth.users);
-- every table keys off auth.users(id). Sensitive columns (*_enc) hold ciphertext
-- written by an Edge Function — never plaintext.

create extension if not exists pgcrypto;

-- profiles (1:1 with auth.users) -------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  photo_url text,
  gender text,
  seeking text,
  marital_status text,
  city text,
  geohash text,
  location_updated_at timestamptz,
  interests jsonb not null default '[]',
  intentions jsonb not null default '{}',
  photos jsonb not null default '[]',
  expo_push_token text,
  is_verified_photo boolean not null default false,
  is_verified_id boolean not null default false,
  intent_score double precision not null default 0.5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- birth_data (SENSITIVE — ciphertext columns) ------------------------------
create table if not exists public.birth_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dob_enc text,
  time_enc text,
  place_enc text,
  created_at timestamptz not null default now()
);

-- psych_profiles ------------------------------------------------------------
create table if not exists public.psych_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  attachment_secure double precision not null default 0,
  attachment_anxious double precision not null default 0,
  attachment_avoidant double precision not null default 0,
  values jsonb not null default '{}',
  big_five jsonb not null default '{}',
  conflict_style text,
  self_expansion double precision not null default 0,
  dealbreakers jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- consent_events (APPEND-ONLY ledger) --------------------------------------
create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null,
  granted boolean not null,
  notice_version text not null,
  method text not null default 'app_toggle',
  created_at timestamptz not null default now()
);
create index if not exists idx_consent_user on public.consent_events(user_id);

-- connection_slots ----------------------------------------------------------
create table if not exists public.connection_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid references auth.users(id) on delete set null,
  state text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_slots_user on public.connection_slots(user_id);

-- matches -------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  score double precision not null default 0,
  explanation jsonb not null default '{}',
  mutual boolean not null default false,
  contact_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, candidate_id)
);
create index if not exists idx_matches_user on public.matches(user_id);
create index if not exists idx_matches_candidate on public.matches(candidate_id);

-- messages (SENSITIVE — body_enc is ciphertext) ----------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body_enc text not null,
  redacted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_match on public.messages(match_id);

-- subscriptions -------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  store text not null,
  status text not null default 'active',
  original_txn_id text,
  expires_at timestamptz,
  in_trial boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subs_user on public.subscriptions(user_id);

-- reports -------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  detail text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- blocks --------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- access_logs (APPEND-ONLY) -------------------------------------------------
create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  subject_id uuid,
  action text not null,
  resource text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_access_subject on public.access_logs(subject_id);

-- Enable RLS everywhere (default-deny until policies in 0002) ---------------
alter table public.profiles         enable row level security;
alter table public.birth_data       enable row level security;
alter table public.psych_profiles   enable row level security;
alter table public.consent_events   enable row level security;
alter table public.connection_slots enable row level security;
alter table public.matches          enable row level security;
alter table public.messages         enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.reports          enable row level security;
alter table public.blocks           enable row level security;
alter table public.access_logs      enable row level security;
