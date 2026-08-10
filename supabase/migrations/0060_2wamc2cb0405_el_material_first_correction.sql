-- AVW Quoting Tool — migration 0060
-- CORRECTION (client instructions, 2026-08-10): 2WAMC2CB0405-EL (Wrap Mitter Contour Combos) —
-- same correction as 2WAMC2CB0405 in migration 0059, same four families (Lower Contour, Upper
-- Contour, Dual Wrap, Mitter Curtain), same material-first (Cloth/Foam) then colour flow, one
-- choice adding all four families together. Same part numbers as 2WAMC2CB0405 (client gave an
-- identical part list for the -EL trigger).
--
-- Core: restored exactly as it was in migration 0027 for this trigger (2x CB0405AMC-23-13 + 2x
-- CB0405AMC-50-13 + 4x WA1M-72-510-5220-CORE — the full 3-core set, since the EL variant always
-- carries the lower-contour core the non-EL drops, same established pattern used throughout this
-- sweep). Removed as a side effect of the flag in migration 0048, put back unchanged here since
-- it was explicitly given before.
--
-- Removes the FLAG badge for 2WAMC2CB0405-EL (lib/catalog/pendingPartBadges.ts) — the last
-- flagged item was 2WAMC2CB0405 itself, corrected in 0059.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = '2WAMC2CB0405-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('2WAMC2CB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('2WAMC2CB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),
  ('2WAMC2CB0405-EL', null, null, null, 'WA1M-72-510-5220-CORE', 4, 3),

  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 4),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 5),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 6),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 7),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 8),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 9),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 10),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 11),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 12),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 13),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 14),
  ('2WAMC2CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 15),

  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 16),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 17),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 18),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 19),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 20),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 21),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 22),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 23),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 24),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 25),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 26),
  ('2WAMC2CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 27);
