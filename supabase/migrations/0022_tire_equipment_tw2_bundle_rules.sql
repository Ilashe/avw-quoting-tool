-- AVW Quoting Tool — migration 0022
-- More Tire Equipment (EQ-FRIC-004A) bundle rules, from client instructions (2026-08-08):
--
-- 1) TB3-EL-0325 — same "-0325" CN1 Chain Conveyor family as migration 0021's TB2-0325 /
--    TB2-EL-0325 / TB3-0325, and same as those, was NOT in the picker's option list — added as
--    a new option (sort_order 19) alongside the existing ones. Bundles 2x
--    TB1ADEA-4B-008-104-FTHR-PE-AVW (same tire brush as the other -0325 parts), [DIRECT], no
--    core, no choice.
--
-- 2) TW2-1655 and TW2-EL-1655 — these WERE already in the picker's option list (migration
--    0014's original 15). Bundle 2x TB1ADEA-4B-116-094-STEPPE-AVW-K (a different tire brush —
--    stepped/"Poodle style" design, for the tire washer family, not the dressing-applicator
--    family), also [DIRECT], no core, no choice. That part didn't exist in `parts` at all yet;
--    added it (price/description from Items (7).xlsx).
--
-- All three: Core Items Required = None (per client's sheet), so no core rows — just the
-- trigger part + one bundled family-item row, same shape as migration 0021.
-- Already applied live via service-role insert; this file is the re-runnable historical record.

-- New picker option for TB3-EL-0325
delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-004A')
  and option_value = 'TB3-EL-0325';

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'tire_equipment_parts', 'TB3-EL-0325', 'TB3-EL-0325', 19
from equipment_items
where sku = 'EQ-FRIC-004A';

-- Bundle rules
delete from part_bundle_rules where trigger_part_number in ('TB3-EL-0325', 'TW2-1655', 'TW2-EL-1655');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('TB3-EL-0325', null, null, 'TB1ADEA-4B-008-104-FTHR-PE-AVW', 2, 1),
  ('TW2-1655', null, null, 'TB1ADEA-4B-116-094-STEPPE-AVW-K', 2, 1),
  ('TW2-EL-1655', null, null, 'TB1ADEA-4B-116-094-STEPPE-AVW-K', 2, 1);
