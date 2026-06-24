-- 0002_policies.sql — Row-Level Security policies. Idempotent (drop-then-create).
--
-- Default-deny: a table with RLS on and no matching policy returns nothing.
-- The SECRET (service_role) key BYPASSES RLS — Edge Functions use it for the
-- writes deliberately NOT granted to end users (matches, messages, slots, subs,
-- access_logs). That keeps matching/scoring, the chat contact-filter, billing
-- verification, and the audit log server-trusted.

-- helper: is the user a participant in a match?
create or replace function public.is_match_participant(p_match uuid, p_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.matches m
    where m.id = p_match and (m.user_id = p_uid or m.candidate_id = p_uid)
  );
$$;

-- profiles: owner full access. (Curated discovery of OTHER profiles is added in a
-- later phase via a restricted view / Edge Function, not a blanket select policy.)
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- birth_data: owner only (never readable by others)
drop policy if exists birth_all_own on public.birth_data;
create policy birth_all_own on public.birth_data for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- psych_profiles: owner only
drop policy if exists psych_all_own on public.psych_profiles;
create policy psych_all_own on public.psych_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- consent_events: APPEND-ONLY — owner inserts + reads; no update/delete policy
drop policy if exists consent_insert_own on public.consent_events;
create policy consent_insert_own on public.consent_events for insert to authenticated with check (user_id = auth.uid());
drop policy if exists consent_select_own on public.consent_events;
create policy consent_select_own on public.consent_events for select to authenticated using (user_id = auth.uid());

-- connection_slots: owner reads; writes via service role (matching Edge Function)
drop policy if exists slots_select_own on public.connection_slots;
create policy slots_select_own on public.connection_slots for select to authenticated using (user_id = auth.uid());

-- matches: either participant reads; writes via service role
drop policy if exists matches_select_part on public.matches;
create policy matches_select_part on public.matches for select to authenticated using (user_id = auth.uid() or candidate_id = auth.uid());

-- messages: participants read; inserts via service role (chat-send filters contacts)
drop policy if exists messages_select_part on public.messages;
create policy messages_select_part on public.messages for select to authenticated using (public.is_match_participant(match_id, auth.uid()));

-- subscriptions: owner reads; writes via service role (billing-verify)
drop policy if exists subs_select_own on public.subscriptions;
create policy subs_select_own on public.subscriptions for select to authenticated using (user_id = auth.uid());

-- reports: reporter inserts + reads own
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports for select to authenticated using (reporter_id = auth.uid());

-- blocks: owner manages their own blocks
drop policy if exists blocks_all_own on public.blocks;
create policy blocks_all_own on public.blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- access_logs: subject reads own; writes via service role only
drop policy if exists access_select_own on public.access_logs;
create policy access_select_own on public.access_logs for select to authenticated using (subject_id = auth.uid());
