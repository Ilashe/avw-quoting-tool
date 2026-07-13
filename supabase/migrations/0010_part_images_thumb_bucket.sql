-- AVW Quoting Tool — migration 0010
-- RLS policies for the part-images-thumb bucket (resized/compressed copies for
-- fast loading in the Items tab parts picker). The bucket itself and its objects
-- were already created/uploaded via the service role key in
-- scripts/compress-part-images.mjs (service role bypasses RLS), so this
-- migration only adds policies for future admin-panel-driven uploads — not
-- required for the app's current read-only usage of the bucket.
-- The original part-images bucket (full-res) is untouched by any of this.

insert into storage.buckets (id, name, public)
values ('part-images-thumb', 'part-images-thumb', true)
on conflict (id) do nothing;

drop policy if exists "part_images_thumb_bucket_read_public" on storage.objects;
create policy "part_images_thumb_bucket_read_public" on storage.objects for select
  using (bucket_id = 'part-images-thumb');

drop policy if exists "part_images_thumb_bucket_write_admin" on storage.objects;
create policy "part_images_thumb_bucket_write_admin" on storage.objects for insert
  with check (
    bucket_id = 'part-images-thumb'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "part_images_thumb_bucket_update_admin" on storage.objects;
create policy "part_images_thumb_bucket_update_admin" on storage.objects for update
  using (
    bucket_id = 'part-images-thumb'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "part_images_thumb_bucket_delete_admin" on storage.objects;
create policy "part_images_thumb_bucket_delete_admin" on storage.objects for delete
  using (
    bucket_id = 'part-images-thumb'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
