-- AVW Quoting Tool — migration 0016
-- Three client requests (2026-07-23):
--
-- 1) Blower Room: new "10 HP or 15 HP?" radio (EQ-BLOW-001A) inserted before "Number of
--    Blowers" (EQ-BLOW-002) via the SKU-suffix sort trick.
--
-- 2) Global color simplification: every color field in the catalog restricted to exactly
--    Black, Blue, Red (plus a No/None option where one already existed). Per client decision,
--    missing colors are ADDED where they weren't previously offered (not just filtered):
--      - Pit Grate Color (EQ-CONV-006): had Gray/Red/Blue/Black/None -> Black/Blue/Red/None
--      - Belt Color (EQ-BELT-005): already Black/Red/Blue/No -> reordered only, no data change
--      - Flight Color (EQ-BELT-006): had Blue/Green/Red/Yellow/No -> Black/Blue/Red/No (Black added)
--      - Safety Stripe Color (EQ-BELT-008): same as Flight Color -> Black/Blue/Red/No (Black added)
--      - Blower Color (EQ-BLOW-003): had Black/Orange/Green/Blue/Yellow -> Black/Blue/Red (Red added)
--    Blower Color's "Type of Blowers" sub-picker has HP/nozzle data per color (e.g.
--    "1HP-Black-5 Nozzle"). Orange/Green/Yellow's sub-pickers (EQ-BLOW-005/006/008) are
--    removed since those colors are no longer selectable. A new Red sub-picker is added at
--    EQ-BLOW-005 (reusing the freed SKU), mapped with the same 1-5HP / 5-32 Nozzle pattern
--    used by every other color (per client instruction to "map the type of blower just like
--    the rest" rather than leave it pending).
--
-- 3) High Pressure Equipment: new "Spinning Wheel Blaster" field (EQ-HP-003A), widget:"pending"
--    ("Waiting for Scott") — distinct from the existing "Wheel Blaster" (EQ-HP-003, which
--    already has Fixed Rocker/Flipping/Pivoting options), no data yet.
--
-- Re-runnable: cleanup block removes these exact SKUs/rules before re-inserting.

-- ── 1) Blower HP class (EQ-BLOW-001A) — new field before Number of Blowers ─────

delete from equipment_items where sku = 'EQ-BLOW-001A';

with cat as (select category_id from equipment_items where sku = 'EQ-BLOW-001')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-BLOW-001A', '10 HP or 15 HP Blower?', cat.category_id, 0,
  '{"field_key": "blower_hp_class", "widget": "radio"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'blower_hp_class', label, value, ord
from equipment_items, (values ('10 HP', '10hp', 1), ('15 HP', '15hp', 2)) as o(label, value, ord)
where sku = 'EQ-BLOW-001A';

-- ── 2a) Pit Grate Color -> Black/Blue/Red/None ─────────────────────────────────

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-CONV-006');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'pit_grate_color', label, value, ord
from equipment_items, (values ('Black', 'black', 1), ('Blue', 'blue', 2), ('Red', 'red', 3), ('None', 'none', 4)) as o(label, value, ord)
where sku = 'EQ-CONV-006';

-- ── 2b) Belt Color -> Black/Blue/Red/No (reordered, no data change) ────────────

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-BELT-005');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'belt_color', label, value, ord
from equipment_items, (values ('Black', 'black', 1), ('Blue', 'blue', 2), ('Red', 'red', 3), ('No', 'no', 4)) as o(label, value, ord)
where sku = 'EQ-BELT-005';

-- ── 2c) Flight Color -> Black/Blue/Red/No (Black added, Green/Yellow removed) ──

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-BELT-006');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'flight_color', label, value, ord
from equipment_items, (values ('Black', 'black', 1), ('Blue', 'blue', 2), ('Red', 'red', 3), ('No', 'no', 4)) as o(label, value, ord)
where sku = 'EQ-BELT-006';

-- ── 2d) Safety Stripe Color -> Black/Blue/Red/No (Black added, Green/Yellow removed)

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-BELT-008');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'safety_stripe_color', label, value, ord
from equipment_items, (values ('Black', 'black', 1), ('Blue', 'blue', 2), ('Red', 'red', 3), ('No', 'no', 4)) as o(label, value, ord)
where sku = 'EQ-BELT-008';

-- ── 2e) Blower Color -> Black/Blue/Red (Red added, Orange/Green/Yellow removed) ─

delete from dependency_rules where rule_name in (
  'eq_blower_seed_type_show_orange', 'eq_blower_seed_type_show_green', 'eq_blower_seed_type_show_yellow',
  'eq_blower_seed_type_show_red'
);
delete from equipment_items where sku in ('EQ-BLOW-005', 'EQ-BLOW-006', 'EQ-BLOW-008');

delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-BLOW-003');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'blower_color', label, value, ord
from equipment_items, (values ('Black', 'black', 1), ('Blue', 'blue', 2), ('Red', 'red', 3)) as o(label, value, ord)
where sku = 'EQ-BLOW-003';

-- New "Type of Blowers" for Red at the freed EQ-BLOW-005 SKU, same HP/nozzle pattern as the
-- other colors
with cat as (select category_id from equipment_items where sku = 'EQ-BLOW-004')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-BLOW-005', 'Type of Blowers', cat.category_id, 0,
  '{"field_key": "type_of_blowers_red", "widget": "select"}'::jsonb
from cat;

insert into equipment_options (item_id, option_key, option_label, option_value, price_modifier, sort_order)
select id, 'type_of_blowers_red', label, value, 0, ord from equipment_items, (values
  ('1HP-Red-5 Nozzle',  '1hp_red_5n',  1),
  ('2HP-Red-12 Nozzle', '2hp_red_12n', 2),
  ('3HP-Red-18 Nozzle', '3hp_red_18n', 3),
  ('4HP-Red-24 Nozzle', '4hp_red_24n', 4),
  ('5HP-Red-32 Nozzle', '5hp_red_32n', 5)
) as t(label, value, ord)
where sku = 'EQ-BLOW-005';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value) values
  ('eq_blower_seed_type_show_red', 'blower_color', 'red', 'show', 'type_of_blowers_red', null);

-- ── 3) Spinning Wheel Blaster (EQ-HP-003A) — new pending field ─────────────────

delete from equipment_items where sku = 'EQ-HP-003A';

with cat as (select category_id from equipment_items where sku = 'EQ-HP-003')
insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-HP-003A', 'Spinning Wheel Blaster', cat.category_id, 0,
  '{"field_key": "spinning_wheel_blaster", "widget": "pending"}'::jsonb
from cat;
