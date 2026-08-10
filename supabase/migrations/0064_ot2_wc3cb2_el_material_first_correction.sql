-- AVW Quoting Tool — migration 0064
-- CORRECTION (client instructions, 2026-08-10): OT2-WC3CB2-EL (Wrap Mitter Contour Combos) —
-- same correction as OT2-WC3CB2 in migration 0063, same four families, same material-first
-- (Cloth/Foam) then colour flow, same part numbers (client gave an identical part list for the
-- -EL trigger).
--
-- Core: restored exactly as it was in migration 0027 (2x CB1AMC-23-13 + 2x CB1AMC-50-13 + 2x
-- WA1M-72-510-5220-CORE — identical to the non-EL variant). Removed as a side effect of the flag
-- in migration 0048/0049, put back unchanged here since it was explicitly given before.
--
-- Removes the FLAG badge for OT2-WC3CB2-EL (lib/catalog/pendingPartBadges.ts) — this was the
-- last flagged item in Wrap Mitter Contour Combos; OT2-WC3CB0405/-EL are the only ones still
-- pending in the broader sweep, and TB3-0325 remains flagged separately.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WC3CB2-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WC3CB2-EL', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('OT2-WC3CB2-EL', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('OT2-WC3CB2-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),

  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 4),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 5),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 6),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 7),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 8),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 9),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 10),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 11),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 12),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 13),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 14),
  ('OT2-WC3CB2-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 15),

  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 16),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 17),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 18),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 19),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 20),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 21),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 22),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 23),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 24),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 25),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 26),
  ('OT2-WC3CB2-EL', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 27);
