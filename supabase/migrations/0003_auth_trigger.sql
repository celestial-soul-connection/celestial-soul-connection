-- 0003_auth_trigger.sql — auto-provision on signup + updated_at maintenance.

-- On every new Supabase Auth user: create their profile row and write the
-- required account_core consent to the append-only ledger.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, nullif(new.raw_user_meta_data->>'name', ''))
    on conflict (id) do nothing;
  insert into public.consent_events (user_id, purpose, granted, notice_version, method)
    values (new.id, 'account_core', true, '2026-06-21', 'signup');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- generic updated_at bumper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subs_updated on public.subscriptions;
create trigger trg_subs_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_slots_updated on public.connection_slots;
create trigger trg_slots_updated before update on public.connection_slots
  for each row execute function public.set_updated_at();
