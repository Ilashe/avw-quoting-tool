-- AVW Quoting Tool — migration 0059
-- CORRECTION (client instructions, 2026-08-10): migration 0057's family-first three-stage flow
-- for 2WAMC2CB0405 was wrong, same misreading fixed for OT2-WC3/OT2-2WAMC2/W1MM5 in migration
-- 0058. Correct flow: material FIRST (Cloth or Foam), then colour — one material+colour choice
-- adds parts from ALL FOUR families together (Lower Contour + Upper Contour + Dual Wrap + Mitter
-- Curtain), not just one at a time. Same two-stage multi-part-per-choice architecture as 0058,
-- just 4 parts per choice instead of 2.
--
-- Core unchanged (2x CB0405AMC-50-13 + 4x WA1M-72-510-5220-CORE, restored in 0057 and untouched
-- here). Part numbers/quantities per family unchanged from 0057 (Lower/Upper contour 2x, Dual
-- wrap 4x matching the dual core, Mitter curtain 42x Cloth / 63x Foam) — only the choice
-- structure and group labels changed.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = '2WAMC2CB0405';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('2WAMC2CB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('2WAMC2CB0405', null, null, null, 'WA1M-72-510-5220-CORE', 4, 2),

  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 3),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 4),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 5),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 6),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 7),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 8),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 9),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 10),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 11),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 12),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 13),
  ('2WAMC2CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 14),

  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 15),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 16),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 17),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 18),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 19),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 20),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 21),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 22),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 23),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 24),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 25),
  ('2WAMC2CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 26);
