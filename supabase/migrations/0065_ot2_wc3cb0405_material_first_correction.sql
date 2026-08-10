-- AVW Quoting Tool — migration 0065
-- CORRECTION (client instructions, 2026-08-10): OT2-WC3CB0405 (Wrap Mitter Contour Combos) —
-- same four-family material-first (Cloth/Foam) then colour correction as OT2-WC3CB2 (migration
-- 0063), but using the CB0405AMA-* contour part family instead of CB1AMA-*.
--
-- Core: restored exactly as it was in migration 0027 (2x CB0405AMC-50-13 + 2x
-- WA1M-72-510-5220-CORE — no lower-contour core, matching the documented "CB0405 non-electric
-- variants are missing the lower core" pattern used throughout this sweep). Removed as a side
-- effect of the flag in migration 0048/0049, put back unchanged here since it was explicitly
-- given before.
--
-- Removes the FLAG badge for OT2-WC3CB0405 only (lib/catalog/pendingPartBadges.ts) — client did
-- not give OT2-WC3CB0405-EL this time, so it stays flagged pending its own correction (the last
-- flagged item in this picker after this migration).
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WC3CB0405';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WC3CB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('OT2-WC3CB0405', null, null, null, 'WA1M-72-510-5220-CORE', 2, 2),

  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 3),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 4),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 5),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 6),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 7),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 8),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 9),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 10),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 11),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 12),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 13),
  ('OT2-WC3CB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 14),

  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 15),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 16),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 17),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 18),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 19),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 20),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 21),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 22),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 23),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 24),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 25),
  ('OT2-WC3CB0405', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 26);
