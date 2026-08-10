-- AVW Quoting Tool — migration 0063
-- CORRECTION (client instructions, 2026-08-10): OT2-WC3CB2 (Wrap Mitter Contour Combos) — same
-- four-family material-first (Cloth/Foam) then colour correction as the 2WAMC2 pair, but with a
-- single Wrap (not Dual wrap) family: Lower Contour, Upper Contour, Wrap, Mitter Curtain — using
-- the CB1AMA-* ("Kaady") contour parts and the "single" 2x wrap quantity (not 4x).
--
-- Core: restored exactly as it was in migration 0027 (2x CB1AMC-23-13 + 2x CB1AMC-50-13 + 2x
-- WA1M-72-510-5220-CORE — the "single" 2x wrap-core quantity, distinguishing it from the 2WAMC2
-- "dual" 4x variants). Removed as a side effect of the flag in migration 0048/0049, put back
-- unchanged here since it was explicitly given before.
--
-- Removes the FLAG badge for OT2-WC3CB2 only (lib/catalog/pendingPartBadges.ts) — client did not
-- give OT2-WC3CB2-EL this time, so it stays flagged pending its own correction.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-WC3CB2';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-WC3CB2', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('OT2-WC3CB2', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('OT2-WC3CB2', null, null, null, 'WA1M-72-510-5220-CORE', 2, 3),

  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 4),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 5),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 6),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 7),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 8),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 9),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 10),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 11),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 12),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 13),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 14),
  ('OT2-WC3CB2', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 15),

  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 16),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 17),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 18),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 19),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 20),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 21),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 22),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 23),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 24),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 25),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 26),
  ('OT2-WC3CB2', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 27);
