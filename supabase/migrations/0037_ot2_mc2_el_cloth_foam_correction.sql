-- AVW Quoting Tool — migration 0037
-- CORRECTION (client instructions, 2026-08-10): same fix as migration 0036, applied to
-- OT2-MC2-EL. No core row (migration 0023: "Core Items Required = None" for this item; an
-- earlier version of this migration wrongly added one, caught and removed same-day — see 0036's
-- note). Cloth (42x all 3 colours) or Foam/Microfiber (63x all 3 colours) material choice, then
-- Black/Blue/Red. No badge to remove — OT2-MC2-EL was never flagged.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-MC2-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-MC2-EL', 'Mitter curtain [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 1),
  ('OT2-MC2-EL', 'Mitter curtain [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 2),
  ('OT2-MC2-EL', 'Mitter curtain [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 3),
  ('OT2-MC2-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 4),
  ('OT2-MC2-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('OT2-MC2-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6);
