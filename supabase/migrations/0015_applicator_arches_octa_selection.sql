-- AVW Quoting Tool — migration 0015
-- Redesigns Applicator Arches (EQ-FRIN-001) from a Yes/No + single flat 26-part picker (0013)
-- into a 4-option radio (Zero/Single/Double/Triple Octa) each revealing its own dedicated
-- multi_part_picker, scoped by part-number prefix per client instruction (2026-07-23):
--   Zero Octa   -> parts matching prefix OT2-AA0
--   Single Octa -> parts matching prefix OT2-AA1
--   Double Octa -> parts matching prefix OT2-AA2
--   Triple Octa -> parts matching prefix OT2-AA3
--
-- Only parts with a confirmed price/description are included (verified against
-- 'Items (5).xlsx', case-insensitive exact match on part_number, same convention as
-- scripts/import-parts-pricing.mjs). 12 prefix matches have an image but NO price/description
-- in either the DB or the new xlsx — excluded here, written to
-- scripts/applicator-arches-octa-missing-pricing.csv for the client to review later.
--
-- SKU-suffix trick (see 0012/0013): '<SKU>A'/'B'/'C'/'D' sort directly after '<SKU>' so all 4
-- pickers render together right under the radio (EquipmentTab.tsx sorts items by sku).
--
-- Re-runnable: cleanup block removes these exact SKUs/rules before re-inserting.

-- ── Reset EQ-FRIN-001 to the new 4-option radio ─────────────────────────────────

delete from dependency_rules where rule_name in (
  'eq_frin_001a_applicator_arches_parts_show',
  'eq_frin_001a_zero_octa_parts_show',
  'eq_frin_001b_single_octa_parts_show',
  'eq_frin_001c_double_octa_parts_show',
  'eq_frin_001d_triple_octa_parts_show'
);
delete from equipment_items where sku in ('EQ-FRIN-001A', 'EQ-FRIN-001B', 'EQ-FRIN-001C', 'EQ-FRIN-001D');

update equipment_items
set metadata = '{"field_key": "applicator_arches", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIN-001';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIN-001');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches', label, value, ord
from equipment_items, (values
  ('Zero Octa', 'zero_octa', 1),
  ('Single Octa', 'single_octa', 2),
  ('Double Octa', 'double_octa', 3),
  ('Triple Octa', 'triple_octa', 4)
) as o(label, value, ord)
where sku = 'EQ-FRIN-001';

-- ── Zero Octa picker (EQ-FRIN-001A) — prefix OT2-AA0, 3 priced parts ────────────

with cat as (select category_id from equipment_items where sku = 'EQ-FRIN-001')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-001A', 'Applicator Arches - Zero Octa Selection', cat.category_id, 0,
  '{"field_key": "applicator_arches_zero_octa_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches_zero_octa_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-AA0', 1), ('OT2-AA0-0622', 2), ('OT2-AA0-14', 3)
) as v(part_number, ord)
where sku = 'EQ-FRIN-001A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_001a_zero_octa_parts_show', 'applicator_arches', 'zero_octa', 'show', 'applicator_arches_zero_octa_parts', null);

-- ── Single Octa picker (EQ-FRIN-001B) — prefix OT2-AA1, 5 priced parts ──────────

with cat as (select category_id from equipment_items where sku = 'EQ-FRIN-001')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-001B', 'Applicator Arches - Single Octa Selection', cat.category_id, 0,
  '{"field_key": "applicator_arches_single_octa_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches_single_octa_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-AA1', 1), ('OT2-AA1-HP1', 2), ('OT2-AA1A', 3), ('OT2-AA1A-0622', 4), ('OT2-AA1X3', 5)
) as v(part_number, ord)
where sku = 'EQ-FRIN-001B';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_001b_single_octa_parts_show', 'applicator_arches', 'single_octa', 'show', 'applicator_arches_single_octa_parts', null);

-- ── Double Octa picker (EQ-FRIN-001C) — prefix OT2-AA2, 6 priced parts ──────────

with cat as (select category_id from equipment_items where sku = 'EQ-FRIN-001')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-001C', 'Applicator Arches - Double Octa Selection', cat.category_id, 0,
  '{"field_key": "applicator_arches_double_octa_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches_double_octa_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-AA2', 1), ('OT2-AA2A', 2), ('OT2-AA2A-0622', 3), ('OT2-AA2B', 4), ('OT2-AA2X3', 5), ('OT2-AA2X3-0622', 6)
) as v(part_number, ord)
where sku = 'EQ-FRIN-001C';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_001c_double_octa_parts_show', 'applicator_arches', 'double_octa', 'show', 'applicator_arches_double_octa_parts', null);

-- ── Triple Octa picker (EQ-FRIN-001D) — prefix OT2-AA3, 1 priced part ───────────

with cat as (select category_id from equipment_items where sku = 'EQ-FRIN-001')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-001D', 'Applicator Arches - Triple Octa Selection', cat.category_id, 0,
  '{"field_key": "applicator_arches_triple_octa_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches_triple_octa_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-AA3X3-0622', 1)
) as v(part_number, ord)
where sku = 'EQ-FRIN-001D';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_001d_triple_octa_parts_show', 'applicator_arches', 'triple_octa', 'show', 'applicator_arches_triple_octa_parts', null);
