-- AVW Quoting Tool — migration 0052
-- CORRECTION (client instructions, 2026-08-10): OT2-WACB2 (Wrap Sidewasher Combos) was flagged
-- in migration 0028 ("logic to be given is not clear yet") and had no bundle rule at all, then
-- reflagged/kept flagged through migrations 0035/0048/0050. Real logic now given: three families
-- — Lower Contour, Upper Contour, Wrap — each available in Cloth or NeoGlide. Prompt flow:
-- CLOTH or NEOGLIDE first (material), then a colour (Black/Blue/Red); the chosen material+colour
-- combination adds all three parts (lower contour + upper contour + wrap) together, all qty 2 —
-- same multi-part-per-choice pattern as CB0405 (migration 0032), just 3 parts per choice instead
-- of 2. choice_group per material: "Combo [CLOTH]" / "Combo [NEOGLIDE]" (covers all three
-- families under one prompt, per the client's description).
--
-- No core row: OT2-WACB2 never had a core specified (migration 0028 explicitly excluded it from
-- core rows, "intentionally excluded"), and the client's family text for this correction gives
-- no core line either — per standing instruction, core is only touched when explicitly given, so
-- none is added here.
--
-- OT2-WACB2-EL was NOT covered by this correction (client only gave OT2-WACB2 this time) — it
-- stays flagged pending its own correction. Remove the FLAG badge from OT2-WACB2 only in
-- lib/catalog/pendingPartBadges.ts.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WACB2';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 1),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 2),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 3),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 4),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 5),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 6),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 7),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 8),
  ('OT2-WACB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 9),

  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 10),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 11),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 12),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 13),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 14),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 15),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 16),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 17),
  ('OT2-WACB2', 'Combo [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 18);
