-- AVW Quoting Tool — migration 0027
-- New field: "Wrap Mitter Contour Combos" (client instructions, 2026-08-08) — did not exist
-- before. Adds EQ-FRIC-010 (Yes/No radio, field_key wrap_mitter_contour_combos) + EQ-FRIC-010A
-- (multi_part_picker, field_key wrap_mitter_contour_combos_parts, shown when the radio = yes),
-- under the Friction Equipment category, with 8 selectable parts.
--
-- Each part combines a Wrap Around core (WA1M-72-510-5220-CORE, 4x for "dual" wrap variants —
-- SKUs starting "2WAMC2" — 2x for "single" — SKUs starting "OT2-WC3") with a Mitter contour
-- core (either the CB0405 family or the CB1/"Kaady" family, matching the part's own name) and
-- the established "Mitter curtain [FOAM/MICROFIBER]" colour choice.
--
-- Notable pattern (client didn't flag as wrong, and it's now the 3rd time this exact pattern
-- appears — see also W1MM5/OT2-W1MM5-EL in migration 0026): the two "CB0405, non-electric"
-- variants (2WAMC2CB0405, OT2-WC3CB0405) are missing BOTH the lower-contour core
-- (CB0405AMC-23-13) AND the Black colour option entirely — not just unprefixed/1x, genuinely
-- absent from the sheet — while every other row (including their own "-EL" counterparts) has
-- both. Taken literally/consistently rather than guessed at.
--
-- Quantity convention (unchanged from earlier migrations): a colour with no leading multiplier
-- in the sheet = 1x. Where the sheet repeats the "Mitter curtain [FOAM/MICROFIBER]:" label with
-- an explicit multiplier before every colour (OT2-WC3CB2-EL, OT2-WC3CB0405-EL), all three/two
-- colours are that same quantity (63x here) instead.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

-- New field
delete from equipment_items where sku in ('EQ-FRIC-010', 'EQ-FRIC-010A');

insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-010', 'Wrap Mitter Contour Combos', id, 0,
  '{"field_key": "wrap_mitter_contour_combos", "widget": "radio"}'::jsonb
from categories where section = 'friction_equipment';

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_mitter_contour_combos', label, value, ord
from equipment_items, (values ('Yes', 'yes', 1), ('No', 'no', 2)) as o(label, value, ord)
where sku = 'EQ-FRIC-010';

insert into equipment_items (sku, name, category_id, unit_price, metadata)
select 'EQ-FRIC-010A', 'Wrap Mitter Contour Combos Selection', id, 0,
  '{"field_key": "wrap_mitter_contour_combos_parts", "widget": "multi_part_picker"}'::jsonb
from categories where section = 'friction_equipment';

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_mitter_contour_combos_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('2WAMC2CB0405', 1), ('2WAMC2CB0405-EL', 2), ('2WAMC2CB2', 3), ('2WAMC2CB2-EL', 4),
  ('OT2-WC3CB2', 5), ('OT2-WC3CB2-EL', 6), ('OT2-WC3CB0405', 7), ('OT2-WC3CB0405-EL', 8)
) as v(part_number, ord)
where sku = 'EQ-FRIC-010A';

insert into dependency_rules (rule_name, trigger_field, trigger_value, action_type, target_field, target_value)
values ('eq_fric_010a_wrap_mitter_contour_combos_parts_show', 'wrap_mitter_contour_combos', 'yes', 'show', 'wrap_mitter_contour_combos_parts', null);

-- Bundle rules
delete from part_bundle_rules where trigger_part_number in
  ('2WAMC2CB0405', '2WAMC2CB0405-EL', '2WAMC2CB2', '2WAMC2CB2-EL', 'OT2-WC3CB2', 'OT2-WC3CB2-EL', 'OT2-WC3CB0405', 'OT2-WC3CB0405-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('2WAMC2CB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('2WAMC2CB0405', null, null, null, 'WA1M-72-510-5220-CORE', 4, 2),
  ('2WAMC2CB0405', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 1, 3),
  ('2WAMC2CB0405', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 4),

  ('2WAMC2CB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('2WAMC2CB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),
  ('2WAMC2CB0405-EL', null, null, null, 'WA1M-72-510-5220-CORE', 4, 3),
  ('2WAMC2CB0405-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 4),
  ('2WAMC2CB0405-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('2WAMC2CB0405-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6),

  ('2WAMC2CB2', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('2WAMC2CB2', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('2WAMC2CB2', null, null, null, 'WA1M-72-510-5220-CORE', 4, 3),
  ('2WAMC2CB2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 4),
  ('2WAMC2CB2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('2WAMC2CB2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6),

  ('2WAMC2CB2-EL', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('2WAMC2CB2-EL', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('2WAMC2CB2-EL', null, null, null, 'WA1M-72-510-5220-CORE', 4, 3),
  ('2WAMC2CB2-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 4),
  ('2WAMC2CB2-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('2WAMC2CB2-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6),

  ('OT2-WC3CB2', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('OT2-WC3CB2', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('OT2-WC3CB2', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),
  ('OT2-WC3CB2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 4),
  ('OT2-WC3CB2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('OT2-WC3CB2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6),

  ('OT2-WC3CB2-EL', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('OT2-WC3CB2-EL', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('OT2-WC3CB2-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),
  ('OT2-WC3CB2-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 4),
  ('OT2-WC3CB2-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('OT2-WC3CB2-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6),

  ('OT2-WC3CB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('OT2-WC3CB0405', null, null, null, 'WA1M-72-510-5220-CORE', 2, 2),
  ('OT2-WC3CB0405', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 1, 3),
  ('OT2-WC3CB0405', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 4),

  ('OT2-WC3CB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('OT2-WC3CB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),
  ('OT2-WC3CB0405-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),
  ('OT2-WC3CB0405-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 4),
  ('OT2-WC3CB0405-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('OT2-WC3CB0405-EL', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6);
