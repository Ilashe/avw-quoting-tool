-- AVW Quoting Tool — migration 0012
-- Robot Arch part picker: when "Robot Arch" (EQ-HP-001) = Yes, a new field appears
-- letting the user pick one or more specific parts (photo + price + description)
-- from the parts catalog. Reuses equipment_options as the curated list of eligible
-- part numbers (option_value = parts.part_number), resolved to real data client-side
-- via the parts/part_images tables.
--
-- SKU note: EQ-HP-004 through EQ-HP-011 were used-then-deleted in migration 0007 (moved to
-- Backroom) — avoiding that range. Fields in a section render sorted by SKU (EquipmentTab.tsx),
-- so 'EQ-HP-001A' (sorts right after 'EQ-HP-001' Robot Arch, before 'EQ-HP-002') keeps this
-- field directly under Robot Arch instead of at the end of the section.
--
-- 19 part numbers have an image; 7 more (added below) have a price/description from the
-- client's QuickBooks Items export but no photo yet (parts.description/unit_price seeded by
-- scripts/add-arch-parts-pricing.mjs, not this migration — parts/part_images rows are always
-- script-managed, not migration-managed). 2 more (AA2-12, OT2-AA0-Z) have neither an image nor
-- a pricing match anywhere and are NOT included until the client provides more info.
--
-- Re-runnable: cleanup block removes this exact SKU/rule before re-inserting.

delete from dependency_rules where rule_name = 'eq_hp_020_robot_arch_parts_show';
delete from equipment_items where sku = 'EQ-HP-001A';

with cat as (select id from categories where tab = 'equipment' and section = 'high_pressure_equipment')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-HP-001A', 'Robot Arch Selection', cat.id, 0,
  '{"field_key": "robot_arch_parts", "widget": "multi_part_picker"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'robot_arch_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('AA0', 1), ('AA012', 2), ('AA014', 3), ('AA0-Z', 4), ('AA0-Z-12113', 5),
  ('AA1', 6), ('AA1-14', 7), ('AA1-LPC', 8), ('AA2-LPC', 9), ('AA0-3X3-5269', 10),
  ('FM1A-C', 11), ('OT2-AA0', 12), ('OT2-AA2', 13), ('OT2-ENTRARCH', 14),
  ('OT2-AA1', 15), ('OT2-AA1X3', 16), ('OT2-AA2X3', 17), ('OT2-AA2X3-0622', 18),
  ('AVW-BWA1', 19),
  -- priced but no photo yet (see scripts/add-arch-parts-pricing.mjs)
  ('AA1-12', 20), ('AA1X3', 21), ('AA2', 22), ('FM1A-C-Z', 23),
  ('OT2-AA0-14', 24), ('OT2-AA0-0622', 25), ('OT2-AA3X3-0622', 26)
) as v(part_number, ord)
where sku = 'EQ-HP-001A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_hp_020_robot_arch_parts_show', 'robot_arch', 'yes', 'show', 'robot_arch_parts', null);
