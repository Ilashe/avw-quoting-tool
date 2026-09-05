-- AVW Quoting Tool — migration 0067
-- Two small additive columns on part_bundle_rules to support the Sept-2026 master-spec
-- reconciliation (see PROJECT_STATUS/session history): both are opt-in, default to their
-- "no-op" value, and every existing row/trigger is completely unaffected until a later data
-- migration explicitly sets them.
--
--   component text — when 2+ distinct non-null values exist among a trigger's choice rows, the
--     picker resolves them as an ADDITIVE queue (ask about each component in turn, sum the
--     results) rather than the existing single merged choice. Used for Contour's independent
--     Lower/Upper zones and every combo's Wrap / Mitter / Lower Contour / Upper Contour / Side
--     Washer components. Left null for every currently-correct single-component trigger
--     (standalone Mitter, Wrap, Top Brush, Tire, Wraps) — no behavior change for those.
--
--   allow_two_color_split boolean — set true only on Mitter's (and Mini Mitter's) color-choice
--     rows, to enable a "one colour or two?" prompt that splits the row's quantity roughly in
--     half across two colours (extra piece to the first-picked colour on an odd total), per the
--     master spec's Component Options sheet. Defaults false (no behavior change) everywhere else.
--
-- This is the ONLY schema change in this reconciliation — everything else (Phases 0, 1, 3-8) is
-- pure data (insert/update/delete) via service-role scripts, no further ALTER TABLEs needed.
-- Please run this once in the Supabase SQL Editor; every subsequent step in this reconciliation
-- runs itself via node scripts against the service-role key, same as the recent migrations.

alter table part_bundle_rules add column if not exists component text;
alter table part_bundle_rules add column if not exists allow_two_color_split boolean not null default false;
