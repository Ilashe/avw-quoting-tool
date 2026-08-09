-- AVW Quoting Tool — migration 0023
-- Top Washers (EQ-FRIC-005A, field_key top_washers_parts): client instructions (2026-08-08)
-- for 8 trigger parts across two families (Matched Rule "Mitter - Regular/Full" vs
-- "Mitter - Mini"). None of the 8 were in the picker's option list yet (previously only
-- TR4/TR4-EL/OT2-TR5/OT2-TR5-EL) — client said to add any missing ones directly rather than
-- ask each time, so all 8 are added here as new options (sort_order 5-12).
--
-- Core Items Required = None for all 8 (client confirmed no core row for this category) — just
-- the trigger part + one chosen colour strip. 3-colour choice (Black/Blue/Red), header taken
-- verbatim from the sheet's own family label per Matched Rule group:
--   "Mitter curtain [FOAM/MICROFIBER]" — OT2-MC2, OT2-MC2-EL, MC2-R-0818, OT2-MC2-R-EL-0818,
--     MC2-0516
--   "Mini miter [FOAM/MICROFIBER]" — OT2-MM5, OT2-MM5-EL, OT2-MM5-R-0818
--
-- Quantity convention (client-confirmed 2026-08-08): a colour with NO number written before it
-- in the sheet means quantity 1 — same rule as CB0405's Blue in migration 0017. This matters
-- here specifically: OT2-MC2, OT2-MC2-EL, OT2-MM5, OT2-MM5-EL all write Black with no leading
-- multiplier ("...BLK OR 63x ...BLUE OR 63x ...RED") -> Black = 1x, Blue/Red = 63x (or 42x for
-- the Mini pair). The other 4 rows (MC2-R-0818, OT2-MC2-R-EL-0818, MC2-0516, OT2-MM5-R-0818)
-- spell out the multiplier for all three colours explicitly -> all three = 63x (or 42x).
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

-- New picker options
delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-005A')
  and option_value in ('OT2-MC2', 'OT2-MC2-EL', 'MC2-R-0818', 'OT2-MC2-R-EL-0818', 'MC2-0516', 'OT2-MM5', 'OT2-MM5-EL', 'OT2-MM5-R-0818');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'top_washers_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-MC2', 5), ('OT2-MC2-EL', 6), ('MC2-R-0818', 7), ('OT2-MC2-R-EL-0818', 8),
  ('MC2-0516', 9), ('OT2-MM5', 10), ('OT2-MM5-EL', 11), ('OT2-MM5-R-0818', 12)
) as v(part_number, ord)
where sku = 'EQ-FRIC-005A';

-- Bundle rules (3-colour choice per trigger, no core rows)
delete from part_bundle_rules where trigger_part_number in
  ('OT2-MC2', 'OT2-MC2-EL', 'MC2-R-0818', 'OT2-MC2-R-EL-0818', 'MC2-0516', 'OT2-MM5', 'OT2-MM5-EL', 'OT2-MM5-R-0818');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-MC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 1),
  ('OT2-MC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 2),
  ('OT2-MC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 3),

  ('OT2-MC2-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 1),
  ('OT2-MC2-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 2),
  ('OT2-MC2-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 3),

  ('MC2-R-0818', 'Mitter curtain [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 1),
  ('MC2-R-0818', 'Mitter curtain [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 2),
  ('MC2-R-0818', 'Mitter curtain [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 3),

  ('OT2-MC2-R-EL-0818', 'Mitter curtain [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 1),
  ('OT2-MC2-R-EL-0818', 'Mitter curtain [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 2),
  ('OT2-MC2-R-EL-0818', 'Mitter curtain [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 3),

  ('MC2-0516', 'Mitter curtain [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 1),
  ('MC2-0516', 'Mitter curtain [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 2),
  ('MC2-0516', 'Mitter curtain [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 3),

  ('OT2-MM5', 'Mini miter [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 1),
  ('OT2-MM5', 'Mini miter [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 2),
  ('OT2-MM5', 'Mini miter [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 3),

  ('OT2-MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 1),
  ('OT2-MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 2),
  ('OT2-MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 3),

  ('OT2-MM5-R-0818', 'Mini miter [FOAM/MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 1),
  ('OT2-MM5-R-0818', 'Mini miter [FOAM/MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 2),
  ('OT2-MM5-R-0818', 'Mini miter [FOAM/MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 3);
