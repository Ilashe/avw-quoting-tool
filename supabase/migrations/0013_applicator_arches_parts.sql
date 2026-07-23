-- AVW Quoting Tool — migration 0013
-- Applicator Arches part picker (Final Rinse section): converts "Applicator Arches"
-- (EQ-FRIN-001, previously a widget:"pending" placeholder) into a Yes/No radio, and adds a
-- multi_part_picker field that appears when it's Yes — same pattern as Robot Arch
-- (migration 0012).
--
-- SKU 'EQ-FRIN-001A' sorts directly after 'EQ-FRIN-001' so the picker renders right under
-- the Yes/No radio (fields in a section render sorted by SKU, see EquipmentTab.tsx).
--
-- By final client decision, this picker's part list is IDENTICAL to Robot Arch's (0012) —
-- the same 26 parts, in the same order. An earlier version of this migration curated a
-- separate 27-part "Applicator"-specific list (from a description search) and then merged in
-- Robot Arch's parts, but the client asked to drop the separate curation entirely and just
-- mirror Robot Arch exactly. AA2-12 and OT2-AA0-Z are excluded from both pickers — no image,
-- price, or description exists for them anywhere in the source data.
--
-- The Quote Summary shows the trigger field's name ("Robot Arch" vs "Applicator Arches") as
-- the Item label so the same part selected under both pickers reads as two distinct
-- selections, not a duplicate (see SummaryPanel.tsx).
--
-- Re-runnable: cleanup block removes this exact SKU/rule before re-inserting. Does NOT touch
-- EQ-FRIN-001's own options/metadata cleanup beyond what's needed to reset it to radio Yes/No.

delete from dependency_rules where rule_name = 'eq_frin_001a_applicator_arches_parts_show';
delete from equipment_items where sku = 'EQ-FRIN-001A';

update equipment_items
set metadata = '{"field_key": "applicator_arches", "widget": "radio"}'::jsonb
where sku = 'EQ-FRIN-001';

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIN-001');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIN-001';

with cat as (select category_id from equipment_items where sku = 'EQ-FRIN-001')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-001A', 'Applicator Arches Selection', cat.category_id, 0,
  '{"field_key": "applicator_arches_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

-- Identical list/order to Robot Arch (0012)
insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('AA0', 1), ('AA012', 2), ('AA014', 3), ('AA0-Z', 4), ('AA0-Z-12113', 5),
  ('AA1', 6), ('AA1-14', 7), ('AA1-LPC', 8), ('AA2-LPC', 9), ('AA0-3X3-5269', 10),
  ('FM1A-C', 11), ('OT2-AA0', 12), ('OT2-AA2', 13), ('OT2-ENTRARCH', 14),
  ('OT2-AA1', 15), ('OT2-AA1X3', 16), ('OT2-AA2X3', 17), ('OT2-AA2X3-0622', 18),
  ('AVW-BWA1', 19),
  ('AA1-12', 20), ('AA1X3', 21), ('AA2', 22), ('FM1A-C-Z', 23),
  ('OT2-AA0-14', 24), ('OT2-AA0-0622', 25), ('OT2-AA3X3-0622', 26)
) as v(part_number, ord)
where sku = 'EQ-FRIN-001A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_001a_applicator_arches_parts_show', 'applicator_arches', 'yes', 'show', 'applicator_arches_parts', null);
