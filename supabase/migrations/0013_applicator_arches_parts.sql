-- AVW Quoting Tool — migration 0013
-- Applicator Arches part picker (Final Rinse section): converts "Applicator Arches"
-- (EQ-FRIN-001, previously a widget:"pending" placeholder) into a Yes/No radio, and adds a
-- multi_part_picker field that appears when it's Yes — same pattern as Robot Arch
-- (migration 0012).
--
-- SKU 'EQ-FRIN-001A' sorts directly after 'EQ-FRIN-001' so the picker renders right under
-- the Yes/No radio (fields in a section render sorted by SKU, see EquipmentTab.tsx).
--
-- 40 parts total: the original 27 curated Applicator-specific candidates (filtered from a
-- "%applicator%" description search, excluding accessories like Top Bars/Legs/Manifolds and
-- unrelated "applicator" items like Tire Dressing/Bug Gun/Wheel Brite/Grill applicators), plus
-- all 26 parts from the Robot Arch picker (0012) per client request — by client decision, the
-- same part can be selectable under both pickers. Client explicitly excluded AA2-12 and
-- OT2-AA0-Z (present in neither picker) since they have no image, price, or description
-- anywhere in the source data — nothing to show.
--
-- The Quote Summary shows the trigger field's name ("Robot Arch" vs "Applicator Arches") as
-- the Item label so overlapping parts read as distinct selections, not duplicates (see
-- SummaryPanel.tsx).
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

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'applicator_arches_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  -- original 27 Applicator-specific candidates
  ('AA1', 1), ('AA1-12', 2), ('AA1-14', 3), ('AA1-5269', 4), ('AA1-HP1', 5),
  ('AA1-LPC', 6), ('AA1-SPRT', 7), ('AA1-Z', 8), ('AA2', 9), ('AA2-HP1', 10),
  ('AA2-LPC', 11), ('AA3', 12), ('AA4', 13), ('AVW-R-AA1-1798', 14), ('AVW-R-AA2', 15),
  ('BEN-OT2-AA1', 16), ('BEN-OT2-AA2', 17), ('R-AA1', 18), ('R-AA1-2324', 19),
  ('OT2-AA1', 20), ('OT2-AA1-HP1', 21), ('OT2-AA1X3', 22), ('OT2-AA2', 23),
  ('OT2-AA2X3', 24), ('OT2-AA2X3-0622', 25), ('OT2-ENTRARCH', 26), ('OT2-AA3X3-0622', 27),
  -- remaining 13 parts from the Robot Arch picker (0012), added per client request
  ('AA1X3', 28), ('FM1A-C-Z', 29), ('OT2-AA0-14', 30), ('OT2-AA0-0622', 31),
  ('AA0', 32), ('AA012', 33), ('AA014', 34), ('AA0-Z', 35), ('AA0-Z-12113', 36),
  ('AA0-3X3-5269', 37), ('FM1A-C', 38), ('OT2-AA0', 39), ('AVW-BWA1', 40)
) as v(part_number, ord)
where sku = 'EQ-FRIN-001A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_frin_001a_applicator_arches_parts_show', 'applicator_arches', 'yes', 'show', 'applicator_arches_parts', null);
