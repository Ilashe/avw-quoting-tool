-- AVW Quoting Tool — migration 0066
-- CORRECTION (client instructions, 2026-08-10): OT2-WC3CB0405-EL (Wrap Mitter Contour Combos) —
-- same correction as OT2-WC3CB0405 in migration 0065, same four families, same material-first
-- (Cloth/Foam) then colour flow, same part numbers (client gave an identical part list for the
-- -EL trigger). This is the LAST flagged item in the Wrap Mitter Contour Combos picker — all 8
-- of the 8 original FLAG items from migration 0049 are now corrected.
--
-- Core: restored exactly as it was in migration 0027 (2x CB0405AMC-23-13 + 2x CB0405AMC-50-13 +
-- 2x WA1M-72-510-5220-CORE — the full 3-core set, the EL variant carrying the lower-contour core
-- the non-EL drops, same established pattern used throughout this sweep). Removed as a side
-- effect of the flag in migration 0048/0049, put back unchanged here since it was explicitly
-- given before.
--
-- Removes the FLAG badge for OT2-WC3CB0405-EL (lib/catalog/pendingPartBadges.ts) — clears the
-- last entry from this field. TB3-0325 remains flagged (separate field, unrelated).
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WC3CB0405-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WC3CB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('OT2-WC3CB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),
  ('OT2-WC3CB0405-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),

  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 4),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 5),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 6),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 7),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 8),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 9),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 10),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 11),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 12),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 13),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 14),
  ('OT2-WC3CB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 15),

  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 16),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 17),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 18),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 19),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 20),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 21),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 22),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 23),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 24),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 25),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 26),
  ('OT2-WC3CB0405-EL', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 27);
