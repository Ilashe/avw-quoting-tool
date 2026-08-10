-- AVW Quoting Tool — migration 0043
-- CORRECTION (client instructions, 2026-08-10): same fix as migration 0042, applied to
-- OT2-MM5-R-EL-0818. No core row (never had one — confirmed against the live DB before this
-- change). Cloth (28x all 3 colours) or Foam/Microfiber (42x all 3 colours) material choice,
-- then Black/Blue/Red. No badge to remove — OT2-MM5-R-EL-0818 was never flagged.
--
-- This completes the full "Mitter curtain" correction sweep across both families: Regular/Full
-- (OT2-MC2, OT2-MC2-EL, MC2-R-0818, OT2-MC2-R-EL-0818, MC2-0516 — migrations 0036-0040) and
-- Mini (OT2-MM5, OT2-MM5-EL, OT2-MM5-R-0818, OT2-MM5-R-EL-0818 — migrations 0041-0043).
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-MM5-R-EL-0818';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-MM5-R-EL-0818', 'Mini miter [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 1),
  ('OT2-MM5-R-EL-0818', 'Mini miter [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 2),
  ('OT2-MM5-R-EL-0818', 'Mini miter [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 3),
  ('OT2-MM5-R-EL-0818', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 4),
  ('OT2-MM5-R-EL-0818', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 5),
  ('OT2-MM5-R-EL-0818', 'Mini miter [FOAM/MICROFIBER]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 6);
