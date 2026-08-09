-- AVW Quoting Tool — migration 0028
-- Wrap Sidewasher Combos (EQ-FRIC-008), from client instructions (2026-08-08). This field
-- already existed as a "pending" placeholder (see 0004) — converted to a real Yes/No radio +
-- EQ-FRIC-008A multi_part_picker, same conversion pattern as Side Washers/Tire Equipment/Top
-- Washers/Wrap Mitter Combos in migration 0014.
--
-- 6 parts total, client instructions were explicit per-part:
--   OT2-WACB2, OT2-WACB2-EL — FLAGGED (client: "logic to be given is not clear yet"). Both rows
--     have an unexplained extra part number ahead of the usual "Wrap [NEOGLIDE]:" family text
--     with no clear OR/quantity structure (same shape of ambiguity as OT2-WC3-EL in 0026) — no
--     bundle rule added, red "FLAG" badge instead.
--   OT2-WSW4, OT2-WSW4-EL — TBD (client: "logic is yet to be determine[d]"), despite the sheet
--     text for these two looking complete/clean — client instruction takes precedence over what
--     the data appears to show. Red "TBD" badge, no bundle rule.
--   OT2-WACB0405, OT2-WACB0405-EL — built normally ("I'm sure you understand the rest"), same
--     established pattern as every other CB0405-family part this session: core = 2x
--     CB0405AMC-50-13 + 2x WA1M-72-510-5220-CORE for the non-EL (no CB0405AMC-23-13, no Black
--     colour option — sheet lists only Blue/Red, both explicitly 2x), vs. the EL variant which
--     has the full 3-core / 3-colour set (adds CB0405AMC-23-13 + Black, all still 2x). This is
--     now the 4th repetition of this non-EL-CB0405-drops-lower-core-and-black pattern this
--     session (see 0021, 0026, 0027) — consistent enough to treat as intentional.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

update equipment_items
set metadata = '{"field_key": "wrap_sidewasher_combos", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIC-008';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-008');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_sidewasher_combos', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-008';

delete from equipment_items where sku = 'EQ-FRIC-008A';

insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-008A', 'Wrap Sidewasher Combos Selection', id, 0,
  '{"field_key": "wrap_sidewasher_combos_parts", "widget": "multi_part_picker"}'::jsonb
from categories where section = 'friction_equipment';

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_sidewasher_combos_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-WSW4', 1), ('OT2-WSW4-EL', 2), ('OT2-WACB2', 3), ('OT2-WACB2-EL', 4),
  ('OT2-WACB0405', 5), ('OT2-WACB0405-EL', 6)
) as v(part_number, ord)
where sku = 'EQ-FRIC-008A';

delete from dependency_rules where rule_name = 'eq_fric_008a_wrap_sidewasher_combos_parts_show';
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value)
values ('eq_fric_008a_wrap_sidewasher_combos_parts_show', 'wrap_sidewasher_combos', 'yes', 'show', 'wrap_sidewasher_combos_parts', null);

-- Bundle rules (OT2-WACB2/OT2-WACB2-EL/OT2-WSW4/OT2-WSW4-EL intentionally excluded)
delete from part_bundle_rules where trigger_part_number in ('OT2-WACB0405', 'OT2-WACB0405-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WACB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('OT2-WACB0405', null, null, null, 'WA1M-72-510-5220-CORE', 2, 2),
  ('OT2-WACB0405', 'Wrap [NEOGLIDE]', null, 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 3),
  ('OT2-WACB0405', 'Wrap [NEOGLIDE]', null, 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 4),

  ('OT2-WACB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('OT2-WACB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),
  ('OT2-WACB0405-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),
  ('OT2-WACB0405-EL', 'Wrap [NEOGLIDE]', null, 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 4),
  ('OT2-WACB0405-EL', 'Wrap [NEOGLIDE]', null, 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 5),
  ('OT2-WACB0405-EL', 'Wrap [NEOGLIDE]', null, 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 6);
