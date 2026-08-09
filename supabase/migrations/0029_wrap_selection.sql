-- AVW Quoting Tool — migration 0029
-- Wraps (EQ-FRIC-009), from client instructions (2026-08-08): "based on the logic we have
-- discussed" — no new patterns needed explaining, applies two already-established mechanisms.
-- Converted from "pending" to a real Yes/No radio + EQ-FRIC-009A multi_part_picker (same
-- conversion pattern as 0014/0028).
--
-- OT2-WA4, OT2-WA4-EL — core 2x WA1M-72-510-5220-CORE, then a genuinely two-stage choice like
--   the Top Brush Foam/Drycloth pattern (0025): material first (Cloth vs NeoGlide — both
--   symmetric this time, 3 colours each at 2x, unlike Foam/Drycloth's asymmetric 3-vs-2),
--   then Black/Blue/Red within whichever material was picked.
-- DWA1, OT2-DWA1-EL — core 4x WA1M-72-510-5220-CORE, then a single non-choice "family" item —
--   just "WA1M-00-510-5220-SS-NG-RD" with no OR clause in the sheet at all, same [DIRECT] shape
--   as the Tire Equipment parts in migration 0021 (added automatically, no colour prompt).
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

update equipment_items
set metadata = '{"field_key": "wrap", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIC-009';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-009');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-009';

delete from equipment_items where sku = 'EQ-FRIC-009A';

insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-009A', 'Wrap Selection', id, 0,
  '{"field_key": "wrap_parts", "widget": "multi_part_picker"}'::jsonb
from categories where section = 'friction_equipment';

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-WA4', 1), ('OT2-WA4-EL', 2), ('DWA1', 3), ('OT2-DWA1-EL', 4)
) as v(part_number, ord)
where sku = 'EQ-FRIC-009A';

delete from dependency_rules where rule_name = 'eq_fric_009a_wrap_parts_show';
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value)
values ('eq_fric_009a_wrap_parts_show', 'wrap', 'yes', 'show', 'wrap_parts', null);

-- Bundle rules
delete from part_bundle_rules where trigger_part_number in ('OT2-WA4', 'OT2-WA4-EL', 'DWA1', 'OT2-DWA1-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WA4', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WA4', 'Wrap [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-WA4', 'Wrap [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 3),
  ('OT2-WA4', 'Wrap [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 4),
  ('OT2-WA4', 'Wrap [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 5),
  ('OT2-WA4', 'Wrap [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 6),
  ('OT2-WA4', 'Wrap [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 7),

  ('OT2-WA4-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WA4-EL', 'Wrap [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-WA4-EL', 'Wrap [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 3),
  ('OT2-WA4-EL', 'Wrap [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 4),
  ('OT2-WA4-EL', 'Wrap [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 5),
  ('OT2-WA4-EL', 'Wrap [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 6),
  ('OT2-WA4-EL', 'Wrap [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 7),

  ('DWA1', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('DWA1', null, null, null, 'WA1M-00-510-5220-SS-NG-RD', 1, 2),

  ('OT2-DWA1-EL', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('OT2-DWA1-EL', null, null, null, 'WA1M-00-510-5220-SS-NG-RD', 1, 2);
