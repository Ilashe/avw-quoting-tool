-- AVW Quoting Tool — migration 0053
-- CORRECTION (client instructions, 2026-08-10): OT2-WACB2-EL (Wrap Sidewasher Combos) — same
-- correction as OT2-WACB2 in migration 0052, same three families (Lower Contour, Upper Contour,
-- Wrap), same Cloth/NeoGlide material choice, same part numbers (client gave an identical part
-- list for the -EL trigger). Prompt flow: CLOTH or NEOGLIDE first, then a colour; the chosen
-- material+colour adds all three parts together, all qty 2 (multi-part-per-choice, same pattern
-- as 0052/CB0405).
--
-- No core row: OT2-WACB2-EL never had a core specified (migration 0028 explicitly excluded it,
-- "intentionally excluded"), and this correction's family text gives no core line either — none
-- added, per standing instruction.
--
-- Removes the FLAG badge for OT2-WACB2-EL (and OT2-WACB2, corrected in 0052) from
-- lib/catalog/pendingPartBadges.ts — both handled in the same badge-removal edit.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WACB2-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 1),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 2),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 3),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 4),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 5),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 6),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 7),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 8),
  ('OT2-WACB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 9),

  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 10),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 11),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 12),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 13),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 14),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 15),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 16),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 17),
  ('OT2-WACB2-EL', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 18);
