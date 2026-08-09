-- AVW Quoting Tool — migration 0021
-- Tire Equipment (EQ-FRIC-004A, field_key tire_equipment_parts): client instructions
-- (2026-08-07) referenced TB2-0325 / TB2-EL-0325 / TB3-0325 — a more specific "-0325" (CN1
-- Chain Conveyor) variant family that did NOT exist in the picker's option list (migration
-- 0014 only added the base TB2/TB2-EL/TB3/... parts, which are genuinely different, separately
-- priced parts, not the same items). Client confirmed (asked directly): add the -0325 variants
-- as new selectable options alongside the existing base ones, not instead of them.
--
-- Each of these 3 has "Core Items Required: None" and a single non-choice "[DIRECT]" family
-- item (no OR / no colour prompt) — 2x TB1ADEA-4B-008-104-FTHR-PE-AVW — so the bundle rule here
-- is the plain "core" shape (choice_group null): the family item is added automatically with no
-- modal, same mechanism as a core item, just conceptually named "family" instead. Quote summary
-- for these will show: the trigger part itself + the one bundled family-item row. No core row,
-- since Core Items Required is "None" for this family.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

-- New picker options (equipment_options), alongside the existing TB2/TB2-EL/TB3/... options —
-- re-runnable by part_number/option_key, sort_order picks up after the existing 15.
delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-004A')
  and option_value in ('TB2-0325', 'TB2-EL-0325', 'TB3-0325');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'tire_equipment_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('TB2-0325', 16), ('TB2-EL-0325', 17), ('TB3-0325', 18)
) as v(part_number, ord)
where sku = 'EQ-FRIC-004A';

-- Bundle rules
delete from part_bundle_rules where trigger_part_number in ('TB2-0325', 'TB2-EL-0325', 'TB3-0325');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('TB2-0325', null, null, 'TB1ADEA-4B-008-104-FTHR-PE-AVW', 2, 1),
  ('TB2-EL-0325', null, null, 'TB1ADEA-4B-008-104-FTHR-PE-AVW', 2, 1),
  ('TB3-0325', null, null, 'TB1ADEA-4B-008-104-FTHR-PE-AVW', 2, 1);
