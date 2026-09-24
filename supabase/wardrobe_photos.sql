-- Wardrobe photo sync. Run once in the Supabase SQL Editor (safe to re-run).
-- Photos are taken into each browser's IndexedDB; a copy goes here so every
-- device you sign in on can show them. Private bucket, one folder per user.

insert into storage.buckets (id, name, public)
values ('wardrobe-images', 'wardrobe-images', false)
on conflict (id) do nothing;

drop policy if exists "Upload own wardrobe photos" on storage.objects;
create policy "Upload own wardrobe photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Replace own wardrobe photos" on storage.objects;
create policy "Replace own wardrobe photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Read own wardrobe photos" on storage.objects;
create policy "Read own wardrobe photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Delete own wardrobe photos" on storage.objects;
create policy "Delete own wardrobe photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);
