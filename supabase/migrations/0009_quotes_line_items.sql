-- AVW Quoting Tool — migration 0009
-- Adds line_items to quotes for the Items tab (Phase 10): parts picked from the
-- parts/part_images catalog, or manual custom lines. Re-runnable.

alter table quotes add column if not exists line_items jsonb not null default '[]'::jsonb;
