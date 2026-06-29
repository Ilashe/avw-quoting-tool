-- AVW Quoting Tool — migration 0005
-- Creates the quotes table: one row per quote, selections stored as JSONB.
-- RLS ensures every user can only see and modify their own quotes.
-- Re-runnable: all statements are idempotent.

create table if not exists quotes (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  customer_name text        not null default '',
  selections    jsonb       not null default '{}',
  status        text        not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table quotes enable row level security;

drop policy if exists "quotes_own" on quotes;
create policy "quotes_own" on quotes
  for all
  using  ((select auth.uid()) = quotes.user_id)
  with check ((select auth.uid()) = quotes.user_id);

-- auto-bump updated_at on every row update
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quotes_updated_at on quotes;
create trigger quotes_updated_at
  before update on quotes
  for each row execute procedure set_updated_at();
