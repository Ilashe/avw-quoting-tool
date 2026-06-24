-- AVW Quoting Tool — Phase 3/4/6 seed
-- Seeds the General-adjacent Equipment sub-tabs delivered in "AVW Quoting Tool Logic
-- 6.23.2026.docx": Conveyor, Belt Specifications, Entrance Module, Presoak, High Pressure
-- Equipment. Pricing is not yet provided by the client — every item/option is seeded with
-- unit_price / price_modifier = 0 until a separate pricing data drop arrives.
--
-- Re-runnable: every statement deletes its own batch (by sku/rule_name prefix) before
-- re-inserting, so this file can be safely re-applied as the client sends more fields for
-- these same sections.

delete from dependency_rules where rule_name like 'eq_conveyor_belt_seed_%';
delete from equipment_items where sku like 'EQ-CONV-%' or sku like 'EQ-BELT-%' or sku like 'EQ-ENT-%' or sku like 'EQ-PRESOAK-%' or sku like 'EQ-HP-%';
delete from categories where tab = 'equipment' and section in ('conveyor', 'belt_specifications', 'entrance_module', 'presoak', 'high_pressure_equipment');

-- ── categories ───────────────────────────────────────────────────────────
insert into categories (tab, section, display_name, sort_order) values
  ('equipment', 'conveyor', 'Conveyor', 10),
  ('equipment', 'belt_specifications', 'Belt Specifications', 20),
  ('equipment', 'entrance_module', 'Entrance Module', 30),
  ('equipment', 'presoak', 'Presoak', 40),
  ('equipment', 'high_pressure_equipment', 'High Pressure Equipment', 50);

-- ── helper: insert one item + its options in a single CTE ─────────────────
-- (Plain inserts; kept verbose/explicit rather than a PL/pgSQL loop so the catalog stays
-- readable and diffable as the client sends more batches.)

-- A. Conveyor
with cat as (select id from categories where tab = 'equipment' and section = 'conveyor')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-CONV-001', 'Conveyor', cat.id, 0,
  '{"field_key": "conveyor", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-CONV-002', 'Conveyor Steel Type', cat.id, 0,
  '{"field_key": "conveyor_steel_type", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-CONV-003', 'Conveyor Length', cat.id, 0,
  '{"field_key": "conveyor_length", "widget": "number", "min": 40, "max": 165, "unit": "in", "allow_none": true, "helper_text": "Need something outside 40–165in? Contact support."}'::jsonb from cat
union all
select 'EQ-CONV-004', 'How Many Pieces of Open Pit', cat.id, 0,
  '{"field_key": "open_pit_count", "widget": "select_range", "min": 1, "max": 10}'::jsonb from cat
union all
select 'EQ-CONV-005', 'How Many Pieces of Closed Pit', cat.id, 0,
  '{"field_key": "closed_pit_count", "widget": "select_range", "min": 1, "max": 10}'::jsonb from cat
union all
select 'EQ-CONV-006', 'Pit Grate Color', cat.id, 0,
  '{"field_key": "pit_grate_color", "widget": "radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'conveyor', label, value, ord from equipment_items, (values
  ('Dual Belt Conveyor', 'dual_belt_conveyor', 1),
  ('Over Under', 'over_under', 2),
  ('None', 'none', 3)) as o(label, value, ord)
where sku = 'EQ-CONV-001'
union all
select id, 'conveyor_steel_type', label, value, ord from equipment_items, (values
  ('Painted Steel', 'painted_steel', 1),
  ('Stainless Steel', 'stainless_steel', 2),
  ('No Conveyor', 'no_conveyor', 3)) as o(label, value, ord)
where sku = 'EQ-CONV-002'
union all
select id, 'pit_grate_color', label, value, ord from equipment_items, (values
  ('Gray', 'gray', 1),
  ('Red', 'red', 2),
  ('Blue', 'blue', 3),
  ('Black', 'black', 4),
  ('None', 'none', 5)) as o(label, value, ord)
where sku = 'EQ-CONV-006';

-- B. Belt Specifications
with cat as (select id from categories where tab = 'equipment' and section = 'belt_specifications')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-BELT-001', 'Roller Correlator', cat.id, 0, '{"field_key": "roller_correlator", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-002', 'Guide Rollers', cat.id, 0, '{"field_key": "guide_rollers", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-003', 'Belt Type', cat.id, 0, '{"field_key": "belt_type", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-004', 'Belt Texture', cat.id, 0, '{"field_key": "belt_texture", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-005', 'Belt Color', cat.id, 0, '{"field_key": "belt_color", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-006', 'Flight Color', cat.id, 0, '{"field_key": "flight_color", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-007', 'Safety Stripe', cat.id, 0, '{"field_key": "safety_stripe", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-008', 'Safety Stripe Color', cat.id, 0, '{"field_key": "safety_stripe_color", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-009', 'Flight Size', cat.id, 0, '{"field_key": "flight_size", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-BELT-010', 'Flight Spacing', cat.id, 0, '{"field_key": "flight_spacing", "widget": "radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'roller_correlator', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-BELT-001'
union all
select id, 'guide_rollers', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-BELT-002'
union all
select id, 'belt_type', label, value, ord from equipment_items, (values ('Standard', 'standard', 1), ('HD', 'hd', 2), ('Hybrid', 'hybrid', 3)) as o(label, value, ord)
where sku = 'EQ-BELT-003'
union all
select id, 'belt_texture', label, value, ord from equipment_items, (values ('Flat', 'flat', 1), ('Diamond Plate', 'diamond_plate', 2)) as o(label, value, ord)
where sku = 'EQ-BELT-004'
union all
select id, 'belt_color', label, value, ord from equipment_items, (values ('Black', 'black', 1), ('Red', 'red', 2), ('Blue', 'blue', 3), ('No', 'no', 4)) as o(label, value, ord)
where sku = 'EQ-BELT-005'
union all
select id, 'flight_color', label, value, ord from equipment_items, (values ('Blue', 'blue', 1), ('Green', 'green', 2), ('Red', 'red', 3), ('Yellow', 'yellow', 4), ('No', 'no', 5)) as o(label, value, ord)
where sku = 'EQ-BELT-006'
union all
select id, 'safety_stripe', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-BELT-007'
union all
select id, 'safety_stripe_color', label, value, ord from equipment_items, (values ('Blue', 'blue', 1), ('Green', 'green', 2), ('Red', 'red', 3), ('Yellow', 'yellow', 4), ('No', 'no', 5)) as o(label, value, ord)
where sku = 'EQ-BELT-008'
union all
select id, 'flight_size', label, value, ord from equipment_items, (values
  ('1"', '1in', 1), ('1.25"', '1_25in', 2), ('1.5"', '1_5in', 3), ('2"', '2in', 4), ('No', 'no', 5)) as o(label, value, ord)
where sku = 'EQ-BELT-009'
union all
select id, 'flight_spacing', label, value, ord from equipment_items, (values
  ('1"', '1in', 1), ('1.25"', '1_25in', 2), ('1.5"', '1_5in', 3), ('2"', '2in', 4)) as o(label, value, ord)
where sku = 'EQ-BELT-010';

-- C. Entrance Module
with cat as (select id from categories where tab = 'equipment' and section = 'entrance_module')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-ENT-001', 'Entrance Module', cat.id, 0, '{"field_key": "entrance_module", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-ENT-002', 'LED Signage', cat.id, 0, '{"field_key": "led_signage", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-ENT-003', 'Photo Eye Stand', cat.id, 0, '{"field_key": "photo_eye_stand", "widget": "radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'entrance_module', label, value, ord from equipment_items, (values
  ('Standard Entrance Module', 'standard_entrance_module', 1),
  ('Mirror Entrance Module', 'mirror_entrance_module', 2)) as o(label, value, ord)
where sku = 'EQ-ENT-001'
union all
select id, 'led_signage', label, value, ord from equipment_items, (values ('Standard Size', 'standard_size', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-ENT-002'
union all
select id, 'photo_eye_stand', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-ENT-003';

-- D. Presoak
with cat as (select id from categories where tab = 'equipment' and section = 'presoak')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-PRESOAK-001', 'Presoak', cat.id, 0, '{"field_key": "presoak", "widget": "radio"}'::jsonb from cat
union all
-- Avalanche dependency on Presoak is not yet fully specified by the client — every option is
-- shown unconditionally for now (per 2026-06-24 decision); revisit once full logic is provided.
select 'EQ-PRESOAK-002', 'Avalanche', cat.id, 0, '{"field_key": "avalanche", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-PRESOAK-003', 'CTA', cat.id, 0, '{"field_key": "cta", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-PRESOAK-004', 'CTA Type', cat.id, 0, '{"field_key": "cta_type", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-PRESOAK-005', 'Underbody Flush', cat.id, 0, '{"field_key": "underbody_flush", "widget": "radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'presoak', label, value, ord from equipment_items, (values
  ('Single Presoak Arch', 'single_presoak_arch', 1),
  ('Double Presoak Arch', 'double_presoak_arch', 2),
  ('Triple Presoak Arch', 'triple_presoak_arch', 3)) as o(label, value, ord)
where sku = 'EQ-PRESOAK-001'
union all
select id, 'avalanche', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-PRESOAK-002'
union all
select id, 'cta', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-PRESOAK-003'
union all
select id, 'cta_type', label, value, ord from equipment_items, (values ('Foaming', 'foaming', 1), ('Non-Foaming', 'non_foaming', 2)) as o(label, value, ord)
where sku = 'EQ-PRESOAK-004'
union all
select id, 'underbody_flush', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-PRESOAK-005';

-- E. High Pressure Equipment
with cat as (select id from categories where tab = 'equipment' and section = 'high_pressure_equipment')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-HP-001', 'Robot Arch', cat.id, 0, '{"field_key": "robot_arch", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-HP-002', 'Pivoting Oscillating Arch', cat.id, 0, '{"field_key": "pivoting_oscillating_arch", "widget": "radio"}'::jsonb from cat
union all
select 'EQ-HP-003', 'Wheel Blaster', cat.id, 0, '{"field_key": "wheel_blaster", "widget": "radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'robot_arch', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-HP-001'
union all
select id, 'pivoting_oscillating_arch', label, value, ord from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-HP-002'
union all
select id, 'wheel_blaster', label, value, ord from equipment_items, (values
  ('Fixed Rocker Blaster', 'fixed_rocker_blaster', 1),
  ('Flipping Wheel Blaster', 'flipping_wheel_blaster', 2),
  ('Pivoting Wheel Blaster', 'pivoting_wheel_blaster', 3),
  ('None', 'none', 4)) as o(label, value, ord)
where sku = 'EQ-HP-003';

-- ── dependency rules ────────────────────────────────────────────────────
-- CTA Type only relevant when CTA = Yes — default-hidden, shown only on that trigger (a
-- 'hide on no' rule would leave it visible while CTA is still unanswered, which is wrong).
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_conveyor_belt_seed_cta_type_show', 'cta', 'yes', 'show', 'cta_type', null);

-- Flight Spacing hidden entirely when Flight Size = No (no flights to space).
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_conveyor_belt_seed_flight_spacing_hide', 'flight_size', 'no', 'hide', 'flight_spacing', null);

-- Flight Spacing options are constrained by the chosen Flight Size (confirmed 2026-06-24):
--   1in   -> 1in, 1.25in
--   1.25in -> 1in, 1.25in
--   1.5in -> 1in, 1.25in, 1.5in
--   2in   -> all
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_conveyor_belt_seed_flight_spacing_exclude_1', 'flight_size', '1in', 'exclude', 'flight_spacing', '1_5in'),
  ('eq_conveyor_belt_seed_flight_spacing_exclude_2', 'flight_size', '1in', 'exclude', 'flight_spacing', '2in'),
  ('eq_conveyor_belt_seed_flight_spacing_exclude_3', 'flight_size', '1_25in', 'exclude', 'flight_spacing', '1_5in'),
  ('eq_conveyor_belt_seed_flight_spacing_exclude_4', 'flight_size', '1_25in', 'exclude', 'flight_spacing', '2in'),
  ('eq_conveyor_belt_seed_flight_spacing_exclude_5', 'flight_size', '1_5in', 'exclude', 'flight_spacing', '2in');
