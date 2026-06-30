-- Add is_pinned and total_value to quotes
-- Re-runnable: ADD COLUMN IF NOT EXISTS guards

alter table quotes add column if not exists is_pinned  boolean      not null default false;
alter table quotes add column if not exists total_value numeric(10,2) not null default 0;
