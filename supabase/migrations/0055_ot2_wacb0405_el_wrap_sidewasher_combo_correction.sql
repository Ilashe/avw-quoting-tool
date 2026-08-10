-- AVW Quoting Tool — migration 0055
-- CORRECTION (client instructions, 2026-08-10): OT2-WACB0405-EL (Wrap Sidewasher Combos) — same
-- correction as OT2-WACB0405 in migration 0054, same three families (Lower Contour, Upper
-- Contour, Wrap), same Cloth/NeoGlide material choice, same part numbers (client gave an
-- identical part list for the -EL trigger).
--
-- Core: restored exactly as it was in migration 0028 for this trigger (2x CB0405AMC-23-13 + 2x
-- CB0405AMC-50-13 + 2x WA1M-72-510-5220-CORE — the full 3-core set, since the EL variant always
-- carries the lower-contour core the non-EL drops, matching the established EL/non-EL pattern
-- from 0021/0026/0027/0028). Removed as a side effect of the blanket flag in migration 0050, put
-- back unchanged here since it was explicitly given before.
--
-- Removes the FLAG badge for OT2-WACB0405-EL (and OT2-WACB0405, corrected in 0054) from
-- lib/catalog/pendingPartBadges.ts — both handled in the same badge-removal edit.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WACB0405-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WACB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('OT2-WACB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),
  ('OT2-WACB0405-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),

  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 4),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 5),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 6),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 7),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 8),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 9),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 10),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 11),
  ('OT2-WACB0405-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 12),

  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 13),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 14),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 15),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 16),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 17),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 18),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 19),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 20),
  ('OT2-WACB0405-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 21);
