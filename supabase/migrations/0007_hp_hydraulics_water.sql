-- AVW Quoting Tool — migration 0007
-- Extends existing Backroom / Chemical Panels section (from 0004):
--   BR-CHEM-003  updated: widget text → select_range 1-5
--   BR-CHEM-004  Air Assist Panels (Yes/No gate)
--   BR-CHEM-005  WA1P Single Air Control Panel qty  (shown when Air Assist Panels = Yes)
--   BR-CHEM-006  WA2P Dual Air Control Panel qty    (shown when Air Assist Panels = Yes)
--   BR-CHEM-007  WA1-SK-2018 Dual Air Assist Kit qty (shown when Air Assist Panels = Yes)
--   BR-CHEM-008  Water Solenoid ½" qty  (always visible)
--   BR-CHEM-009  Water Solenoid ¾" qty  (always visible)
--   BR-CHEM-010  Water Solenoid 1"  qty (always visible)
-- Adds new Backroom / Hydraulics section
-- Adds new Backroom / Water section
--
-- Re-runnable: cleanup block removes any items placed incorrectly in earlier
-- versions of this migration (EQ-HP-004+, BR-HPP-*) as well as the current
-- BR-CHEM-003 through BR-CHEM-010 and new sections before re-inserting.
-- Pricing not yet provided — all unit_price = 0.
-- Water Treatment Center uses widget='pending' (Sobrite types TBD).

-- ── cleanup ───────────────────────────────────────────────────────────────────
delete from dependency_rules
  where rule_name like 'eq_hp_007_%'
     or rule_name like 'br_hp_007_%'
     or rule_name like 'br_chem_007_%'
     or rule_name like 'br_hyd_007_%';

delete from equipment_items where sku in (
  -- items incorrectly placed in Equipment tab in an earlier run
  'EQ-HP-004','EQ-HP-005','EQ-HP-006','EQ-HP-007','EQ-HP-008',
  'EQ-HP-009','EQ-HP-010','EQ-HP-011',
  -- items incorrectly placed in a High Pressure Pumping section in an earlier run
  'BR-HPP-001','BR-HPP-002','BR-HPP-003','BR-HPP-004',
  'BR-HPP-005','BR-HPP-006','BR-HPP-007','BR-HPP-008',
  -- BR-CHEM-003 being updated (text → select_range); 004-010 are new
  'BR-CHEM-003','BR-CHEM-004','BR-CHEM-005','BR-CHEM-006','BR-CHEM-007',
  'BR-CHEM-008','BR-CHEM-009','BR-CHEM-010',
  -- Hydraulics + Water sections
  'BR-HYD-001','BR-HYD-002','BR-HYD-003',
  'BR-WAT-001','BR-WAT-002','BR-WAT-003','BR-WAT-004',
  'BR-WAT-005','BR-WAT-006','BR-WAT-007','BR-WAT-008'
);

delete from categories
  where tab = 'backroom' and section in ('high_pressure_pumping','hydraulics','water');

-- ── Backroom / Chemical Panels — extend existing section ─────────────────────
with cat as (select id from categories where tab = 'backroom' and section = 'chemical_panels')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'BR-CHEM-003', 'How Many Pump Stations?',                              cat.id, 0, '{"field_key":"pump_station_count",    "widget":"select_range","min":1,"max":5}'::jsonb from cat union all
select 'BR-CHEM-004', 'Air Assist Panels',                                    cat.id, 0, '{"field_key":"air_assist_panels",     "widget":"radio"}'::jsonb from cat union all
select 'BR-CHEM-005', 'WA1P Single Air Control Panel – How many?',            cat.id, 0, '{"field_key":"wa1p_panel_qty",        "widget":"select_range","min":1,"max":5}'::jsonb from cat union all
select 'BR-CHEM-006', 'WA2P Dual Air Control Panel – How many?',              cat.id, 0, '{"field_key":"wa2p_panel_qty",        "widget":"select_range","min":1,"max":5}'::jsonb from cat union all
select 'BR-CHEM-007', 'WA1-SK-2018 Retracted Dual Air Assist Kit – How many?', cat.id, 0, '{"field_key":"wa1_sk_2018_qty",     "widget":"select_range","min":1,"max":5}'::jsonb from cat union all
select 'BR-CHEM-008', 'Water Solenoid ½" – How many?',                        cat.id, 0, '{"field_key":"water_solenoid_half_in","widget":"select_range","min":1,"max":7}'::jsonb from cat union all
select 'BR-CHEM-009', 'Water Solenoid ¾" – How many?',                        cat.id, 0, '{"field_key":"water_solenoid_3_4_in", "widget":"select_range","min":1,"max":7}'::jsonb from cat union all
select 'BR-CHEM-010', 'Water Solenoid 1" – How many?',                        cat.id, 0, '{"field_key":"water_solenoid_1_in",   "widget":"select_range","min":1,"max":7}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'air_assist_panels', label, value, ord from equipment_items, (values
  ('Yes', 'yes', 1),
  ('No',  'no',  2)
) as o(label, value, ord)
where sku = 'BR-CHEM-004';

-- ── new Backroom sections ─────────────────────────────────────────────────────
insert into categories (tab, section, display_name, sort_order) values
  ('backroom', 'hydraulics', 'Hydraulics', 20),
  ('backroom', 'water',      'Water',      30);

-- ── Backroom / Hydraulics ─────────────────────────────────────────────────────
with cat as (select id from categories where tab = 'backroom' and section = 'hydraulics')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'BR-HYD-001', 'Hydraulic Units',             cat.id, 0, '{"field_key":"hydraulic_unit_type","widget":"radio"}'::jsonb from cat union all
select 'BR-HYD-002', 'Hydraulic Units – How many?', cat.id, 0, '{"field_key":"hydraulic_unit_qty", "widget":"select_range","min":1,"max":5}'::jsonb from cat union all
select 'BR-HYD-003', 'Air Compressor',              cat.id, 0, '{"field_key":"air_compressor",     "widget":"radio"}'::jsonb from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'hydraulic_unit_type', label, value, ord from equipment_items, (values
  ('None',    'none',    1),
  ('1 Port',  '1_port',  2),
  ('2 Ports', '2_ports', 3),
  ('3 Ports', '3_ports', 4),
  ('4 Ports', '4_ports', 5),
  ('5 Ports', '5_ports', 6),
  ('6 Ports', '6_ports', 7),
  ('7 Ports', '7_ports', 8),
  ('8 Ports', '8_ports', 9)
) as o(label, value, ord)
where sku = 'BR-HYD-001'
union all
select id, 'air_compressor', label, value, ord from equipment_items, (values
  ('None',                                         'none',                   1),
  ('1 Screw Compressor 7.5 HP',                    '1_screw_7_5hp',          2),
  ('2 Screw Compressor 7.5 HP',                    '2_screw_7_5hp',          3),
  ('Dual 7.5 HP Duplex Piston Air Compressor',     'dual_duplex_piston',     4),
  ('Single 7.5 HP Vertical Piston Air Compressor', 'single_vertical_piston', 5),
  ('Double 7.5 HP Vertical Piston Air Compressor', 'double_vertical_piston', 6)
) as o(label, value, ord)
where sku = 'BR-HYD-003';

-- ── Backroom / Water ──────────────────────────────────────────────────────────
with cat as (select id from categories where tab = 'backroom' and section = 'water')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'BR-WAT-001', 'Water Treatment Center', cat.id, 0, '{"field_key":"water_treatment_center","widget":"pending"}'::jsonb from cat union all
select 'BR-WAT-002', 'Water Reclaim System',   cat.id, 0, '{"field_key":"water_reclaim_system",  "widget":"radio"}'::jsonb   from cat union all
select 'BR-WAT-003', 'Reverse Osmosis System', cat.id, 0, '{"field_key":"reverse_osmosis_system","widget":"radio"}'::jsonb   from cat union all
select 'BR-WAT-004', 'Single RO/Reject Tank',  cat.id, 0, '{"field_key":"single_ro_reject_tank", "widget":"radio"}'::jsonb   from cat union all
select 'BR-WAT-005', 'Spot Free Water Tank',   cat.id, 0, '{"field_key":"spot_free_water_tank",  "widget":"radio"}'::jsonb   from cat union all
select 'BR-WAT-006', 'Reject Water Tank',      cat.id, 0, '{"field_key":"reject_water_tank",     "widget":"radio"}'::jsonb   from cat union all
select 'BR-WAT-007', 'Water Boiler',           cat.id, 0, '{"field_key":"water_boiler",          "widget":"radio"}'::jsonb   from cat union all
select 'BR-WAT-008', 'Water Softener',         cat.id, 0, '{"field_key":"water_softener",        "widget":"radio"}'::jsonb   from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'water_reclaim_system', label, value, ord from equipment_items, (values
  ('120 GPM Reclaim System', '120_gpm_reclaim', 1),
  ('No',                     'no',              2)
) as o(label, value, ord)
where sku = 'BR-WAT-002'
union all
select id, 'reverse_osmosis_system', label, value, ord from equipment_items, (values
  ('Purclean 15,000', 'purclean_15000', 1),
  ('Purclean 6,000',  'purclean_6000',  2),
  ('No',              'no',             3)
) as o(label, value, ord)
where sku = 'BR-WAT-003'
union all
select id, 'single_ro_reject_tank', label, value, ord from equipment_items, (values
  ('Yes', 'yes', 1),
  ('No',  'no',  2)
) as o(label, value, ord)
where sku = 'BR-WAT-004'
union all
select id, 'spot_free_water_tank', label, value, ord from equipment_items, (values
  ('500 Gallon Purclean Tank',              'purclean_500', 1),
  ('500 Gallon Water Treatment Center Tank','wtc_500',      2),
  ('None',                                 'none',          3)
) as o(label, value, ord)
where sku = 'BR-WAT-005'
union all
select id, 'reject_water_tank', label, value, ord from equipment_items, (values
  ('400 Gallon Purclean Tank',              'purclean_400', 1),
  ('400 Gallon Water Treatment Center Tank','wtc_400',      2),
  ('None',                                 'none',          3)
) as o(label, value, ord)
where sku = 'BR-WAT-006'
union all
select id, 'water_boiler', label, value, ord from equipment_items, (values
  ('PVI 400,000 BTU', 'pvi_400k_btu', 1),
  ('PVI 800,000 BTU', 'pvi_800k_btu', 2)
) as o(label, value, ord)
where sku = 'BR-WAT-007'
union all
select id, 'water_softener', label, value, ord from equipment_items, (values
  ('Yes', 'yes', 1),
  ('No',  'no',  2)
) as o(label, value, ord)
where sku = 'BR-WAT-008';

-- ── dependency rules ──────────────────────────────────────────────────────────
-- pump_station_count shown only when High Pressure Pumping Station = Yes
-- (trigger field_key is 'high_pressure_pumping_station' set in migration 0004 / BR-CHEM-002)
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('br_chem_007_pump_count_show', 'high_pressure_pumping_station', 'yes', 'show', 'pump_station_count', null);

-- WA panel quantities shown only when Air Assist Panels = Yes
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('br_chem_007_wa1p_show',  'air_assist_panels', 'yes', 'show', 'wa1p_panel_qty',  null),
  ('br_chem_007_wa2p_show',  'air_assist_panels', 'yes', 'show', 'wa2p_panel_qty',  null),
  ('br_chem_007_wa1sk_show', 'air_assist_panels', 'yes', 'show', 'wa1_sk_2018_qty', null);

-- hydraulic_unit_qty hidden when Hydraulic Units = None
insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('br_hyd_007_unit_qty_hide', 'hydraulic_unit_type', 'none', 'hide', 'hydraulic_unit_qty', null);
