-- AVW Quoting Tool — migration 0054
-- CORRECTION (client instructions, 2026-08-10): OT2-WACB0405 (Wrap Sidewasher Combos) had a
-- real bundle rule built in migration 0028 (core = 2x CB0405AMC-50-13 + 2x WA1M-72-510-5220-CORE,
-- one "Wrap [NEOGLIDE]" colour choice covering Blue/Red only), but that rule was wiped in
-- migration 0050 when the client asked to blanket-flag every item in this field pending a full
-- correction pass. Real logic now given, matching the OT2-WACB2/OT2-WACB2-EL pattern (0052/0053):
-- three families — Lower Contour, Upper Contour, Wrap — each in Cloth or NeoGlide. Prompt flow:
-- CLOTH or NEOGLIDE first, then a colour (Black/Blue/Red now, not just Blue/Red); the chosen
-- material+colour adds all three parts together, all qty 2 (multi-part-per-choice).
--
-- Core: restored exactly as it was in migration 0028 (2x CB0405AMC-50-13 + 2x
-- WA1M-72-510-5220-CORE) — this core was explicitly given before (not invented here), only
-- removed as a side effect of the blanket flag in 0050, so it's put back unchanged per standing
-- instruction (core is only touched when explicitly given/changed, never as a side effect of a
-- family/colour correction).
--
-- Removes the FLAG badge for OT2-WACB0405 only (lib/catalog/pendingPartBadges.ts) — client did
-- not give OT2-WACB0405-EL this time, so it stays flagged pending its own correction.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WACB0405';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WACB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('OT2-WACB0405', null, null, null, 'WA1M-72-510-5220-CORE', 2, 2),

  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 3),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 4),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 5),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 6),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 7),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 8),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 9),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 10),
  ('OT2-WACB0405', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 11),

  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 12),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 13),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 14),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 15),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 16),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 17),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 18),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 19),
  ('OT2-WACB0405', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 20);
