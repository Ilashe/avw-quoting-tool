-- AVW Quoting Tool — migration 0061
-- CORRECTION (client instructions, 2026-08-10): 2WAMC2CB2 (Wrap Mitter Contour Combos) — same
-- four-family (Lower Contour, Upper Contour, Dual Wrap, Mitter Curtain) material-first
-- (Cloth/Foam) then colour correction as 2WAMC2CB0405/-EL (migrations 0059/0060), using the
-- CB1AMA-* ("Kaady") contour part family instead of CB0405AMA-*.
--
-- Core: restored exactly as it was in migration 0027 (2x CB1AMC-23-13 + 2x CB1AMC-50-13 + 4x
-- WA1M-72-510-5220-CORE — the full 2-contour-core set; unlike the CB0405 non-EL variant, 2WAMC2CB2
-- was never missing its lower-contour core). Removed as a side effect of the flag in migration
-- 0048/0049, put back unchanged here since it was explicitly given before.
--
-- Removes the FLAG badge for 2WAMC2CB2 only (lib/catalog/pendingPartBadges.ts) — client did not
-- give 2WAMC2CB2-EL this time, so it stays flagged pending its own correction.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = '2WAMC2CB2';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('2WAMC2CB2', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('2WAMC2CB2', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('2WAMC2CB2', null, null, null, 'WA1M-72-510-5220-CORE', 4, 3),

  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 4),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 5),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 6),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 7),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 8),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 9),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 10),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 11),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 12),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 13),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 14),
  ('2WAMC2CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 15),

  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 16),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 17),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 18),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 19),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 20),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 21),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 22),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 23),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 24),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 25),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 26),
  ('2WAMC2CB2', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 27);
