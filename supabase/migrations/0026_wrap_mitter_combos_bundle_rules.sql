-- AVW Quoting Tool — migration 0026
-- Wrap Mitter Combos (EQ-FRIC-006A, field_key wrap_mitter_combos_parts): client instructions
-- (2026-08-08) for 5 new trigger parts, none of which were in the picker's option list yet
-- (added as new options, sort_order 19-23).
--
-- OT2-WC3-EL — EXPLICITLY EXCLUDED per client instruction ("I have no full information on the
-- logic yet"). No bundle rule added; flagged instead with a red "FLAG" badge (same mechanism as
-- TR4/TR4-EL — see lib/catalog/pendingPartBadges.ts). Its sheet row has an unexplained extra
-- part number (MC1E-12W79L-S-CL-AVW-RD) ahead of the usual Mitter curtain family text, with no
-- clear OR/quantity structure — not safe to guess.
--
-- The other 4 all follow the established Mitter-curtain-family pattern (core = 2x or 4x
-- WA1M-72-510-5220-CORE, then a Black/Blue/Red — or in one case Blue/Red only — choice):
--   OT2-WC3: core 2x. All 3 colours explicitly "63x" in the sheet -> 63x each.
--   OT2-2WAMC2 (dual): core 4x. Black has no leading multiplier in the sheet (-> 1x, same
--     convention as CB0405/OT2-MC2 etc.), Blue/Red explicitly "63x".
--   W1MM5, OT2-W1MM5-EL (Mini family): core 2x. Sheet lists ONLY Blue (no leading multiplier
--     -> 1x) and Red (explicit "42x") — Black is genuinely absent from the sheet for this
--     family, not just unquantified, so no Black option was added (unlike OT2-MM5/OT2-MM5-EL,
--     which do have all 3 colours). Flagged in the client conversation as an interpretation
--     worth double-checking, since it diverges from every other Mini-family trigger so far.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

-- New picker options
delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-006A')
  and option_value in ('OT2-WC3', 'OT2-WC3-EL', 'OT2-2WAMC2', 'W1MM5', 'OT2-W1MM5-EL');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'wrap_mitter_combos_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-WC3', 19), ('OT2-WC3-EL', 20), ('OT2-2WAMC2', 21), ('W1MM5', 22), ('OT2-W1MM5-EL', 23)
) as v(part_number, ord)
where sku = 'EQ-FRIC-006A';

-- Bundle rules (OT2-WC3-EL intentionally excluded)
delete from part_bundle_rules where trigger_part_number in ('OT2-WC3', 'OT2-2WAMC2', 'W1MM5', 'OT2-W1MM5-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WC3', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WC3', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 2),
  ('OT2-WC3', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 3),
  ('OT2-WC3', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 4),

  ('OT2-2WAMC2', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('OT2-2WAMC2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 1, 2),
  ('OT2-2WAMC2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 3),
  ('OT2-2WAMC2', 'Mitter curtain [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 4),

  ('W1MM5', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('W1MM5', 'Mini miter [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 1, 2),
  ('W1MM5', 'Mini miter [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 3),

  ('OT2-W1MM5-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-W1MM5-EL', 'Mini miter [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 1, 2),
  ('OT2-W1MM5-EL', 'Mini miter [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 3);
