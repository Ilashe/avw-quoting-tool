-- AVW Quoting Tool — migration 0017
-- General-purpose "part bundle" mechanism: when a given part is selected in ANY
-- multi_part_picker field (Side Washers, Robot Arch, Applicator Arches, etc.), automatically
-- add required companion parts alongside it. Two kinds of bundle row:
--   1) core (choice_group is null): always added, fixed quantity, no prompt.
--   2) choice (choice_group is set): user is prompted to pick exactly one option from the
--      group (e.g. "colour"); only the chosen option's part is added.
-- Rules are keyed by trigger_part_number, not by field/picker — the same rule fires no matter
-- which picker the trigger part is selected from. Client said more of these are coming, so this
-- is meant to be pure data going forward (new rows, no new code).
--
-- First rule, from client instructions (2026-08-07): selecting CB0405 (Side Washers) requires
-- 2x CB0405AMC-23-13 + 2x CB0405AMC-50-13 (core), then a "NEOGLIDE colour" choice: Blue -> 1x
-- CB0405AMA-50-13-S-NG-BL, Red -> 2x CB0405AMA-50-13-S-NG-RD. Note: client initially called the
-- "-BL" option "Black", but its own description in the pricing sheet (Items (7).xlsx) reads
-- "...per brush, Blue" — client confirmed "Blue" is correct, not Black. choice_group is spelled
-- "NEOGLIDE colour" (not "colour") per client instruction — the "NG" in these part numbers
-- stands for NeoGlide, and the prompt should say so explicitly, in that exact spelling.
--
-- Re-runnable: cleanup block removes existing rows for this trigger_part_number before
-- re-inserting.

create table if not exists part_bundle_rules (
  id uuid primary key default gen_random_uuid(),
  trigger_part_number text not null,
  choice_group text,
  choice_label text,
  required_part_number text not null,
  quantity int not null default 1,
  sort_order int not null default 0
);

alter table part_bundle_rules enable row level security;

drop policy if exists "catalog_read_authenticated" on part_bundle_rules;
create policy "catalog_read_authenticated" on part_bundle_rules for select
  using (auth.uid() is not null);

drop policy if exists "catalog_write_admin" on part_bundle_rules;
create policy "catalog_write_admin" on part_bundle_rules for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── CB0405 bundle ────────────────────────────────────────────────────────────

delete from part_bundle_rules where trigger_part_number = 'CB0405';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('CB0405', null, null, 'CB0405AMC-23-13', 2, 1),
  ('CB0405', null, null, 'CB0405AMC-50-13', 2, 2),
  ('CB0405', 'NEOGLIDE colour', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 1, 3),
  ('CB0405', 'NEOGLIDE colour', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 4);
