-- AVW Quoting Tool — migration 0008
-- Standalone parts catalog: part_number -> price/description (from client CSV, TBD)
-- plus a Storage bucket + part_images table for the part photo library.
-- Not yet linked to equipment_items/equipment_options — that mapping comes once
-- the client's CSV and field-mapping decisions arrive. Re-runnable.

create table if not exists parts (
  part_number text primary key,
  description text,
  unit_price   numeric(12, 2),
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists part_images (
  id           uuid        primary key default gen_random_uuid(),
  part_number  text        not null references parts(part_number) on delete cascade,
  storage_path text        not null,
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now()
);

alter table parts enable row level security;
alter table part_images enable row level security;

drop policy if exists "parts_read_authenticated" on parts;
create policy "parts_read_authenticated" on parts for select
  using (auth.uid() is not null);

drop policy if exists "parts_write_admin" on parts;
create policy "parts_write_admin" on parts for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "part_images_read_authenticated" on part_images;
create policy "part_images_read_authenticated" on part_images for select
  using (auth.uid() is not null);

drop policy if exists "part_images_write_admin" on part_images;
create policy "part_images_write_admin" on part_images for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- reuses set_updated_at() from migration 0005
drop trigger if exists parts_updated_at on parts;
create trigger parts_updated_at
  before update on parts
  for each row execute procedure set_updated_at();

-- ── Storage bucket for part photos ──────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('part-images', 'part-images', true)
on conflict (id) do nothing;

drop policy if exists "part_images_bucket_read_public" on storage.objects;
create policy "part_images_bucket_read_public" on storage.objects for select
  using (bucket_id = 'part-images');

drop policy if exists "part_images_bucket_write_admin" on storage.objects;
create policy "part_images_bucket_write_admin" on storage.objects for insert
  with check (
    bucket_id = 'part-images'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "part_images_bucket_update_admin" on storage.objects;
create policy "part_images_bucket_update_admin" on storage.objects for update
  using (
    bucket_id = 'part-images'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "part_images_bucket_delete_admin" on storage.objects;
create policy "part_images_bucket_delete_admin" on storage.objects for delete
  using (
    bucket_id = 'part-images'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
