-- AVW Quoting Tool — migration 0004
-- Adds:
--   Equipment tab   → Friction Equipment, Final Rinse, Blower Room sections
--   Fixtures & Signs tab → Entrance Module (moved from Equipment), Prepare to Unload Sign field
--   Misc Tunnel Equipment tab → Include Install & Ladder Rack Parts section
--   Backroom tab    → Chemical Panels section
--
-- Re-runnable: deletes by sku/rule_name prefix before re-inserting.
-- Fields without confirmed options use widget='pending' (renders "Waiting for Scott").
-- Pricing not yet provided — all unit_price / price_modifier = 0.

delete from dependency_rules
  where rule_name like 'eq_blower_seed_%';
delete from equipment_items
  where sku like 'EQ-FRIC-%'
     or sku like 'EQ-FRIN-%'
     or sku like 'EQ-BLOW-%'
     or sku like 'FX-ENT-%'
     or sku like 'MTE-ILR-%'
     or sku like 'BR-CHEM-%';
delete from categories
  where (tab = 'equipment'              and section in ('friction_equipment','final_rinse','blower_room'))
     or (tab = 'fixtures_signs'         and section = 'prepare_to_unload')
     or (tab = 'misc_tunnel_equipment'  and section = 'install_ladder_rack')
     or (tab = 'backroom'               and section = 'chemical_panels');

-- ── Move Entrance Module from Equipment → Fixtures & Signs ────────────────────
-- Idempotent: matches on section name regardless of current tab value.
update categories set tab = 'fixtures_signs' where section = 'entrance_module';

-- ── categories ────────────────────────────────────────────────────────────────

insert into categories (tab, section, display_name, sort_order) values
  ('equipment',             'friction_equipment',    'Friction Equipment',                   60),
  ('equipment',             'final_rinse',           'Final Rinse',                          70),
  ('equipment',             'blower_room',           'Blower Room',                          80),
  ('fixtures_signs',        'prepare_to_unload',     'Prepare to Unload Sign',               20),
  ('misc_tunnel_equipment', 'install_ladder_rack',   'Include Install & Ladder Rack Parts',  10),
  ('backroom',              'chemical_panels',       'Chemical Panels',                      10);

-- ── Friction Equipment ────────────────────────────────────────────────────────

with cat as (select id from categories where tab = 'equipment' and section = 'friction_equipment')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-001', 'Combos',                  cat.id, 0, '{"field_key":"combos",                    "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-002', 'What Type of Cloth?',     cat.id, 0, '{"field_key":"what_type_of_cloth",         "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-003', 'Sidewashers',             cat.id, 0, '{"field_key":"sidewashers",                "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-004', 'Tire Equipment',          cat.id, 0, '{"field_key":"tire_equipment",             "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-005', 'Top Washers',             cat.id, 0, '{"field_key":"top_washers",                "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-006', 'Wrap Mitter Combos',      cat.id, 0, '{"field_key":"wrap_mitter_combos",         "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-007', 'Wrap Mitter Side Combos', cat.id, 0, '{"field_key":"wrap_mitter_side_combos",    "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-008', 'Wrap Sidewasher Combos',  cat.id, 0, '{"field_key":"wrap_sidewasher_combos",     "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIC-009', 'Wrap',                    cat.id, 0, '{"field_key":"wrap",                       "widget":"pending"}'::jsonb from cat;

-- ── Final Rinse ───────────────────────────────────────────────────────────────

with cat as (select id from categories where tab = 'equipment' and section = 'final_rinse')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIN-001', 'Applicator Arches',      cat.id, 0, '{"field_key":"applicator_arches",       "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIN-002', 'Shower Rinse Manifolds', cat.id, 0, '{"field_key":"shower_rinse_manifolds",  "widget":"pending"}'::jsonb from cat union all
select 'EQ-FRIN-003', 'Mirror Rinse',           cat.id, 0, '{"field_key":"mirror_rinse",            "widget":"pending"}'::jsonb from cat;

-- ── Blower Room ───────────────────────────────────────────────────────────────

with cat as (select id from categories where tab = 'equipment' and section = 'blower_room')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-BLOW-001', 'Glass Block Rinse Wall Ring', cat.id, 0, '{"field_key":"glass_block_rinse_wall_ring", "widget":"pending"}'::jsonb  from cat union all
select 'EQ-BLOW-002', 'Number of Blowers',           cat.id, 0, '{"field_key":"number_of_blowers",  "widget":"select_range","min":1,"max":20}'::jsonb from cat union all
select 'EQ-BLOW-003', 'Color',                       cat.id, 0, '{"field_key":"blower_color",        "widget":"radio"}'::jsonb             from cat union all
select 'EQ-BLOW-004', 'Type of Blowers',             cat.id, 0, '{"field_key":"type_of_blowers_black",  "widget":"select"}'::jsonb         from cat union all
select 'EQ-BLOW-005', 'Type of Blowers',             cat.id, 0, '{"field_key":"type_of_blowers_orange", "widget":"select"}'::jsonb         from cat union all
select 'EQ-BLOW-006', 'Type of Blowers',             cat.id, 0, '{"field_key":"type_of_blowers_green",  "widget":"select"}'::jsonb         from cat union all
select 'EQ-BLOW-007', 'Type of Blowers',             cat.id, 0, '{"field_key":"type_of_blowers_blue",   "widget":"select"}'::jsonb         from cat union all
select 'EQ-BLOW-008', 'Type of Blowers',             cat.id, 0, '{"field_key":"type_of_blowers_yellow", "widget":"select"}'::jsonb         from cat union all
select 'EQ-BLOW-009', 'Blower Arches',               cat.id, 0, '{"field_key":"blower_arches",       "widget":"pending"}'::jsonb           from cat union all
select 'EQ-BLOW-010', 'Blower Frame',                cat.id, 0, '{"field_key":"blower_frame",         "widget":"pending"}'::jsonb           from cat union all
select 'EQ-BLOW-011', 'Miscellaneous Blower Items',  cat.id, 0, '{"field_key":"misc_blower_items",    "widget":"pending"}'::jsonb           from cat union all
select 'EQ-BLOW-012', 'Heated Dryers',               cat.id, 0, '{"field_key":"heated_dryers",        "widget":"radio"}'::jsonb             from cat union all
select 'EQ-BLOW-013', 'Drying Huggers',              cat.id, 0, '{"field_key":"drying_huggers",       "widget":"radio"}'::jsonb             from cat;

-- Blower color options
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'blower_color', label, value, 0, ord from equipment_items, (values
  ('Black',  'black',  1),
  ('Orange', 'orange', 2),
  ('Green',  'green',  3),
  ('Blue',   'blue',   4),
  ('Yellow', 'yellow', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-003';

-- Type of Blowers — Black
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'type_of_blowers_black', label, value, 0, ord from equipment_items, (values
  ('1HP-Black-5 Nozzle',  '1hp_black_5n',  1),
  ('2HP-Black-12 Nozzle', '2hp_black_12n', 2),
  ('3HP-Black-18 Nozzle', '3hp_black_18n', 3),
  ('4HP-Black-24 Nozzle', '4hp_black_24n', 4),
  ('5HP-Black-32 Nozzle', '5hp_black_32n', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-004';

-- Type of Blowers — Orange
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'type_of_blowers_orange', label, value, 0, ord from equipment_items, (values
  ('1HP-Orange-5 Nozzle',  '1hp_orange_5n',  1),
  ('2HP-Orange-12 Nozzle', '2hp_orange_12n', 2),
  ('3HP-Orange-18 Nozzle', '3hp_orange_18n', 3),
  ('4HP-Orange-24 Nozzle', '4hp_orange_24n', 4),
  ('5HP-Orange-32 Nozzle', '5hp_orange_32n', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-005';

-- Type of Blowers — Green
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'type_of_blowers_green', label, value, 0, ord from equipment_items, (values
  ('1HP-Green-5 Nozzle',  '1hp_green_5n',  1),
  ('2HP-Green-12 Nozzle', '2hp_green_12n', 2),
  ('3HP-Green-18 Nozzle', '3hp_green_18n', 3),
  ('4HP-Green-24 Nozzle', '4hp_green_24n', 4),
  ('5HP-Green-32 Nozzle', '5hp_green_32n', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-006';

-- Type of Blowers — Blue
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'type_of_blowers_blue', label, value, 0, ord from equipment_items, (values
  ('1HP-Blue-5 Nozzle',  '1hp_blue_5n',  1),
  ('2HP-Blue-12 Nozzle', '2hp_blue_12n', 2),
  ('3HP-Blue-18 Nozzle', '3hp_blue_18n', 3),
  ('4HP-Blue-24 Nozzle', '4hp_blue_24n', 4),
  ('5HP-Blue-32 Nozzle', '5hp_blue_32n', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-007';

-- Type of Blowers — Yellow
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'type_of_blowers_yellow', label, value, 0, ord from equipment_items, (values
  ('1HP-Yellow-5 Nozzle',  '1hp_yellow_5n',  1),
  ('2HP-Yellow-12 Nozzle', '2hp_yellow_12n', 2),
  ('3HP-Yellow-18 Nozzle', '3hp_yellow_18n', 3),
  ('4HP-Yellow-24 Nozzle', '4hp_yellow_24n', 4),
  ('5HP-Yellow-32 Nozzle', '5hp_yellow_32n', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-008';

-- Heated Dryers options
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'heated_dryers', label, value, 0, ord from equipment_items, (values
  ('2 – 900,000 BTU Natural Gas Heated Dryers', 'natural_gas', 1),
  ('2 – 900,000 BTU Propane Heated Dryers',     'propane',     2),
  ('No',                                         'no',          3)
) as t(label, value, ord)
where sku = 'EQ-BLOW-012';

-- Drying Huggers options
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'drying_huggers', label, value, 0, ord from equipment_items, (values
  ('Include Drying Huggers', 'include', 1),
  ('No',                     'no',      2)
) as t(label, value, ord)
where sku = 'EQ-BLOW-013';

-- Blower Room dependency rules
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_blower_seed_type_show_black',  'blower_color', 'black',  'show', 'type_of_blowers_black',  null),
  ('eq_blower_seed_type_show_orange', 'blower_color', 'orange', 'show', 'type_of_blowers_orange', null),
  ('eq_blower_seed_type_show_green',  'blower_color', 'green',  'show', 'type_of_blowers_green',  null),
  ('eq_blower_seed_type_show_blue',   'blower_color', 'blue',   'show', 'type_of_blowers_blue',   null),
  ('eq_blower_seed_type_show_yellow', 'blower_color', 'yellow', 'show', 'type_of_blowers_yellow', null);

-- ── Fixtures & Signs — Prepare to Unload Sign ─────────────────────────────────

with cat as (select id from categories where tab = 'fixtures_signs' and section = 'prepare_to_unload')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'FX-ENT-001', 'Prepare to Unload Sign', cat.id, 0,
  '{"field_key":"prepare_to_unload_sign","widget":"radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'prepare_to_unload_sign', label, value, 0, ord from equipment_items, (values
  ('Prepare to Unload Sign', 'prepare_to_unload_sign', 1),
  ('No',                     'no',                     2)
) as t(label, value, ord)
where sku = 'FX-ENT-001';

-- ── Miscellaneous Tunnel Equipment — Install & Ladder Rack ───────────────────

with cat as (select id from categories where tab = 'misc_tunnel_equipment' and section = 'install_ladder_rack')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'MTE-ILR-001', 'Install & Ladder Rack Parts', cat.id, 0,
  '{"field_key":"install_ladder_rack_parts","widget":"pending"}'::jsonb from cat;

-- ── Backroom — Chemical Panels ────────────────────────────────────────────────

with cat as (select id from categories where tab = 'backroom' and section = 'chemical_panels')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'BR-CHEM-001', 'Chemical Panels',               cat.id, 0, '{"field_key":"chemical_panels",               "widget":"radio"}'::jsonb  from cat union all
select 'BR-CHEM-002', 'High Pressure Pumping Station', cat.id, 0, '{"field_key":"high_pressure_pumping_station", "widget":"radio"}'::jsonb  from cat union all
select 'BR-CHEM-003', 'How Many Pump Stations?',       cat.id, 0, '{"field_key":"pump_station_count",           "widget":"text"}'::jsonb   from cat;

-- Chemical Panels options
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'chemical_panels', label, value, 0, ord from equipment_items, (values
  ('DispenseIT',   'dispenseit',   1),
  ('Hydrominders', 'hydrominders', 2)
) as t(label, value, ord)
where sku = 'BR-CHEM-001';

-- High Pressure Pumping Station options
insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'high_pressure_pumping_station', label, value, 0, ord from equipment_items, (values
  ('Yes', 'yes', 1),
  ('No',  'no',  2)
) as t(label, value, ord)
where sku = 'BR-CHEM-002';
