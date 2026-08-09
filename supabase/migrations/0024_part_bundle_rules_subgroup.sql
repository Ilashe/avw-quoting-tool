-- AVW Quoting Tool — migration 0024
-- Adds two-stage bundle-choice support: some parts (e.g. TR1105-0325's Top Brush) need the user
-- to pick a MATERIAL first (Foam vs Drycloth), and only then see the colour options for that
-- material — a choice within a choice. `choice_subgroup` groups the existing choice rows by
-- that first-stage value; rows sharing a `choice_group` but different `choice_subgroup` values
-- trigger the two-stage prompt in MultiPartPicker.tsx. Existing single-stage rules are
-- unaffected — they leave choice_subgroup null, which behaves exactly as before.
--
-- ⚠️ Schema change — needs to be run in the Supabase SQL Editor (same as migration 0017;
-- can't be applied via the service-role REST connection, DDL isn't exposed there).

alter table part_bundle_rules add column if not exists choice_subgroup text;
