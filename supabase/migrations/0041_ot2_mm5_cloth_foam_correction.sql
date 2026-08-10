-- AVW Quoting Tool — migration 0041
-- CORRECTION (client instructions, 2026-08-10): same fix as migrations 0036-0040, applied to
-- the "Mitter - Mini" family (OT2-MM5, OT2-MM5-EL). No core row (migration 0023: "Core Items
-- Required = None" for both items). Cloth (28x all 3 colours) or Foam/Microfiber (42x all 3
-- colours) material choice, then Black/Blue/Red — smaller quantities than the Regular/Full
-- family (42x/63x), matching the Mini basket's smaller curtain size. No badges to remove —
-- neither was ever flagged.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('OT2-MM5', 'OT2-MM5-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-MM5', 'Mini miter [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 1),
  ('OT2-MM5', 'Mini miter [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 2),
  ('OT2-MM5', 'Mini miter [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 3),
  ('OT2-MM5', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 4),
  ('OT2-MM5', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 5),
  ('OT2-MM5', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 6),

  ('OT2-MM5-EL', 'Mini miter [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 1),
  ('OT2-MM5-EL', 'Mini miter [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 2),
  ('OT2-MM5-EL', 'Mini miter [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 3),
  ('OT2-MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 4),
  ('OT2-MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 5),
  ('OT2-MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 6);
