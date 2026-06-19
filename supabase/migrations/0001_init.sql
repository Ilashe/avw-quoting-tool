-- AVW Equipment Configurator — Phase 1 schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push` once the
-- project is linked). Safe to re-run: every statement is idempotent.

create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'salesperson' check (role in ('admin', 'salesperson', 'distributor')),
  company text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'salesperson')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── equipment catalog ───────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tab text not null,
  section text not null,
  display_name text not null,
  sort_order int not null default 0
);

create table if not exists equipment_items (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  category_id uuid references categories on delete set null,
  unit_price numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists equipment_options (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references equipment_items on delete cascade,
  option_key text not null,
  option_label text not null,
  option_value text not null,
  price_modifier numeric(12, 2) not null default 0,
  sort_order int not null default 0
);

create table if not exists dependency_rules (
  id uuid primary key default gen_random_uuid(),
  rule_name text not null,
  trigger_field text not null,
  trigger_value text not null,
  action_type text not null check (action_type in ('show', 'hide', 'require', 'set_value', 'exclude')),
  target_field text not null,
  target_value text
);

alter table categories enable row level security;
alter table equipment_items enable row level security;
alter table equipment_options enable row level security;
alter table dependency_rules enable row level security;

drop policy if exists "catalog_read_authenticated" on categories;
create policy "catalog_read_authenticated" on categories for select
  using (auth.uid() is not null);

drop policy if exists "catalog_write_admin" on categories;
create policy "catalog_write_admin" on categories for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_read_authenticated" on equipment_items;
create policy "catalog_read_authenticated" on equipment_items for select
  using (auth.uid() is not null);

drop policy if exists "catalog_write_admin" on equipment_items;
create policy "catalog_write_admin" on equipment_items for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_read_authenticated" on equipment_options;
create policy "catalog_read_authenticated" on equipment_options for select
  using (auth.uid() is not null);

drop policy if exists "catalog_write_admin" on equipment_options;
create policy "catalog_write_admin" on equipment_options for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_read_authenticated" on dependency_rules;
create policy "catalog_read_authenticated" on dependency_rules for select
  using (auth.uid() is not null);

drop policy if exists "catalog_write_admin" on dependency_rules;
create policy "catalog_write_admin" on dependency_rules for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── quotes + revisions ──────────────────────────────────────────────────
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null,
  customer_name text,
  ship_to_state text,
  ship_to_country text default 'US',
  project_type text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'won', 'lost')),
  created_by uuid references profiles on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_revisions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes on delete cascade,
  revision_label text not null,
  config_snapshot jsonb not null default '{}'::jsonb,
  line_items jsonb not null default '[]'::jsonb,
  total_price numeric(12, 2) not null default 0,
  saved_by uuid references profiles on delete set null,
  saved_at timestamptz not null default now(),
  notes text
);

alter table quotes enable row level security;
alter table quote_revisions enable row level security;

drop policy if exists "quotes_owner_or_admin" on quotes;
create policy "quotes_owner_or_admin" on quotes for all
  using (
    created_by = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    created_by = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "quote_revisions_via_parent_quote" on quote_revisions;
create policy "quote_revisions_via_parent_quote" on quote_revisions for all
  using (
    exists (
      select 1 from quotes q
      where q.id = quote_revisions.quote_id
        and (q.created_by = auth.uid() or exists (
          select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  )
  with check (
    exists (
      select 1 from quotes q
      where q.id = quote_revisions.quote_id
        and (q.created_by = auth.uid() or exists (
          select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );
