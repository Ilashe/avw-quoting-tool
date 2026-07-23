-- AVW Quoting Tool — migration 0014
-- 1) Empties the Robot Arch Selection picker's part list (client wants the field to stay in
--    the tool/interface — only the curated selection resets to empty; new parts to be supplied
--    later). Robot Arch (EQ-HP-001) and its picker (EQ-HP-001A) stay active/visible; only the
--    equipment_options rows (the 26 parts from migration 0012) are removed.
-- 2) Converts 5 more Friction Equipment / Final Rinse fields from widget:"pending" placeholders
--    into Yes/No radio + multi_part_picker pairs, same pattern as Applicator Arches (0013):
--    Tire Equipment, Top Washers, Side Washers ("Sidewashers"), Wrap Mitter Combos,
--    Shower Rinse Manifolds.
--
-- Part lists sourced from client message (2026-07-20) + Items (4).xlsx for price/description
-- (seeded by scripts/add-friction-final-rinse-parts-pricing.mjs, not this migration — parts/
-- part_images rows are always script-managed). "OTC-MC2" in the client's Wrap Mitter Combos
-- list was confirmed a typo for "OT2-MC2" (no OTC-MC2 exists in the Items export; OT2-MC2
-- matches the naming pattern of the other Octa² parts in the same list).
--
-- SKU-suffix trick (see 0012/0013): '<SKU>A' sorts directly after '<SKU>' so the picker
-- renders right under its Yes/No radio (EquipmentTab.tsx sorts items by sku).
--
-- Re-runnable: cleanup block removes these exact SKUs/rules before re-inserting.

-- ── 1) Empty Robot Arch Selection's part list (picker stays, list resets to empty) ────
-- Also re-activates EQ-HP-001/EQ-HP-001A in case an earlier draft of this migration (which
-- incorrectly soft-deleted them via is_active=false) was already run — safe/idempotent either way.

update equipment_items set is_active = true where sku in ('EQ-HP-001', 'EQ-HP-001A');

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-HP-001A');

-- ── 2) Tire Equipment (EQ-FRIC-004 / EQ-FRIC-004A) ─────────────────────────────

delete from dependency_rules where rule_name = 'eq_fric_004a_tire_equipment_parts_show';
delete from equipment_items where sku = 'EQ-FRIC-004A';

update equipment_items
set metadata = '{"field_key": "tire_equipment", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIC-004';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-004');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'tire_equipment', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-004';

with cat as (select category_id from equipment_items where sku = 'EQ-FRIC-004')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-004A', 'Tire Equipment Selection', cat.category_id, 0,
  '{"field_key": "tire_equipment_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'tire_equipment_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('TB2', 1), ('TB2-EL', 2), ('TB2-1120', 3), ('TB2-1120-EL', 4), ('TB2-NP', 5),
  ('TB3', 6), ('TB3-EL', 7), ('TB3-1120', 8), ('TB3-1120-EL', 9),
  ('TB4', 10), ('TB4-EL', 11), ('TW2', 12), ('TW2-EL', 13), ('TW2-1655', 14), ('TW2-EL-1655', 15)
) as v(part_number, ord)
where sku = 'EQ-FRIC-004A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_fric_004a_tire_equipment_parts_show', 'tire_equipment', 'yes', 'show', 'tire_equipment_parts', null);

-- ── 3) Top Washers (EQ-FRIC-005 / EQ-FRIC-005A) ────────────────────────────────

delete from dependency_rules where rule_name = 'eq_fric_005a_top_washers_parts_show';
delete from equipment_items where sku = 'EQ-FRIC-005A';

update equipment_items
set metadata = '{"field_key": "top_washers", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIC-005';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-005');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'top_washers', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-005';

with cat as (select category_id from equipment_items where sku = 'EQ-FRIC-005')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-005A', 'Top Washers Selection', cat.category_id, 0,
  '{"field_key": "top_washers_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'top_washers_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('TR4', 1), ('TR4-EL', 2), ('OT2-TR5', 3), ('OT2-TR5-EL', 4)
) as v(part_number, ord)
where sku = 'EQ-FRIC-005A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_fric_005a_top_washers_parts_show', 'top_washers', 'yes', 'show', 'top_washers_parts', null);

-- ── 4) Side Washers / "Sidewashers" (EQ-FRIC-003 / EQ-FRIC-003A) ──────────────

delete from dependency_rules where rule_name = 'eq_fric_003a_sidewashers_parts_show';
delete from equipment_items where sku = 'EQ-FRIC-003A';

update equipment_items
set metadata = '{"field_key": "sidewashers", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIC-003';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-003');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'sidewashers', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-003';

with cat as (select category_id from equipment_items where sku = 'EQ-FRIC-003')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-003A', 'Side Washers Selection', cat.category_id, 0,
  '{"field_key": "sidewashers_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'sidewashers_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('FM1W', 1), ('CB0405-EL', 2), ('CB0405', 3), ('CB2-EL', 4), ('CB2', 5),
  ('RB1-EL-0122', 6), ('RB1-0122', 7), ('SW2-EL', 8), ('SW2', 9), ('FM1W-EL', 10)
) as v(part_number, ord)
where sku = 'EQ-FRIC-003A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_fric_003a_sidewashers_parts_show', 'sidewashers', 'yes', 'show', 'sidewashers_parts', null);

-- ── 5) Wrap Mitter Combos (EQ-FRIC-006 / EQ-FRIC-006A) ─────────────────────────

delete from dependency_rules where rule_name = 'eq_fric_006a_wrap_mitter_combos_parts_show';
delete from equipment_items where sku = 'EQ-FRIC-006A';

update equipment_items
set metadata = '{"field_key": "wrap_mitter_combos", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIC-006';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-006');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_mitter_combos', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-006';

with cat as (select category_id from equipment_items where sku = 'EQ-FRIC-006')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-006A', 'Wrap Mitter Combos Selection', cat.category_id, 0,
  '{"field_key": "wrap_mitter_combos_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

-- 'OTC-MC2' from the client's list corrected to 'OT2-MC2' (confirmed typo — see header note)
insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_mitter_combos_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('MC2', 1), ('MC2-EL', 2), ('MC2-R-0818', 3), ('MC2-R-EL-0818', 4),
  ('OT2-MC2', 5), ('OT2-MC2-EL', 6), ('OT2-MM5', 7), ('OT2-MM5-EL', 8),
  ('DM2-EL', 9), ('DMM5', 10), ('DMM5-EL', 11), ('OT2-DM2', 12), ('OT2-DM2-EL', 13),
  ('MM5', 14), ('MM5-EL', 15), ('MM5-R-EL-0818', 16), ('OT2-MM5-R-0818', 17), ('OT2-MM5-R-EL-0818', 18)
) as v(part_number, ord)
where sku = 'EQ-FRIC-006A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_fric_006a_wrap_mitter_combos_parts_show', 'wrap_mitter_combos', 'yes', 'show', 'wrap_mitter_combos_parts', null);

-- ── 6) Shower Rinse Manifolds (EQ-FRIN-002 / EQ-FRIN-002A) ─────────────────────

delete from dependency_rules where rule_name = 'eq_frin_002a_shower_rinse_manifolds_parts_show';
delete from equipment_items where sku = 'EQ-FRIN-002A';

update equipment_items
set metadata = '{"field_key": "shower_rinse_manifolds", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIN-002';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIN-002');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'shower_rinse_manifolds', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIN-002';

with cat as (select category_id from equipment_items where sku = 'EQ-FRIN-002')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-002A', 'Shower Rinse Manifolds Selection', cat.category_id, 0,
  '{"field_key": "shower_rinse_manifolds_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'shower_rinse_manifolds_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('AA5DA-1', 1), ('AA5DC-30', 2), ('AA5DB', 3), ('SQHS1420050', 4),
  ('FW12', 5), ('HN1213', 6), ('UB-SQ050X1500', 7)
) as v(part_number, ord)
where sku = 'EQ-FRIN-002A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_002a_shower_rinse_manifolds_parts_show', 'shower_rinse_manifolds', 'yes', 'show', 'shower_rinse_manifolds_parts', null);
