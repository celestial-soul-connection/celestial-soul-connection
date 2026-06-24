-- 0004_storage.sql — private Storage buckets + owner-scoped object policies.
-- Objects are stored under a folder named the user's id ("<uid>/file.jpg"); a
-- user can only read/write inside their own folder. Buckets are PRIVATE — the
-- app shows photos via short-lived signed URLs, never public links.

insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('kyc', 'kyc', false)
  on conflict (id) do nothing;

drop policy if exists photos_owner_all on storage.objects;
create policy photos_owner_all on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists kyc_owner_all on storage.objects;
create policy kyc_owner_all on storage.objects for all to authenticated
  using (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);
