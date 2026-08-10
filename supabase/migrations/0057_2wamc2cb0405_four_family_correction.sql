-- AVW Quoting Tool — migration 0057
-- CORRECTION (client instructions, 2026-08-10): 2WAMC2CB0405 (Wrap Mitter Contour Combos) was
-- flagged in migration 0048 and had its bundle rule wiped, then reflagged again in 0049. Real
-- logic now given: FOUR families — Lower Contour, Upper Contour, Dual Wrap, Mitter Curtain —
-- each in Cloth or Foam (the client's client-wide rename in migration 0056 applies to this new
-- correction too: FOAM label, not NeoGlide, from the start). Prompt flow: CLOTH or FOAM first,
-- then a colour (Black/Blue/Red); the chosen material+colour adds that one family's part —
-- unlike the 3-part-per-choice WACB2/WACB0405 pattern, here each of the 4 families is its own
-- independent three-stage choice_group (Category:Material compound subgroup), same architecture
-- as OT2-WC3/W1MM5/OT2-2WAMC2 (migrations 0046/0047), just 4 categories instead of 2. Mitter
-- Curtain now has both a Cloth option (new, 42x, part numbers not seen before this correction)
-- and the existing Foam/Microfiber option (63x, unchanged part numbers/quantities from 0027).
--
-- Core: restored exactly as it was in migration 0027 (2x CB0405AMC-50-13 + 4x
-- WA1M-72-510-5220-CORE — no lower-contour core, matching the documented "CB0405 non-electric
-- variants are missing the lower core" pattern from that migration). Removed as a side effect of
-- the flag in 0048, put back unchanged here since it was explicitly given before — per standing
-- instruction, core is only touched when explicitly given/changed, never as a side effect of a
-- family/colour correction.
--
-- Removes the FLAG badge for 2WAMC2CB0405 only (lib/catalog/pendingPartBadges.ts) — client did
-- not give 2WAMC2CB0405-EL this time, so it stays flagged pending its own correction.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = '2WAMC2CB0405';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('2WAMC2CB0405', null, null, null, 'CB0405AMC-50-13', 2, 1),
  ('2WAMC2CB0405', null, null, null, 'WA1M-72-510-5220-CORE', 4, 2),

  ('2WAMC2CB0405', 'Lower contour [CLOTH]', 'Lower contour:Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 3),
  ('2WAMC2CB0405', 'Lower contour [CLOTH]', 'Lower contour:Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 4),
  ('2WAMC2CB0405', 'Lower contour [CLOTH]', 'Lower contour:Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 5),
  ('2WAMC2CB0405', 'Lower contour [FOAM]', 'Lower contour:Foam', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 6),
  ('2WAMC2CB0405', 'Lower contour [FOAM]', 'Lower contour:Foam', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 7),
  ('2WAMC2CB0405', 'Lower contour [FOAM]', 'Lower contour:Foam', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 8),

  ('2WAMC2CB0405', 'Upper contour [CLOTH]', 'Upper contour:Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 9),
  ('2WAMC2CB0405', 'Upper contour [CLOTH]', 'Upper contour:Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 10),
  ('2WAMC2CB0405', 'Upper contour [CLOTH]', 'Upper contour:Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 11),
  ('2WAMC2CB0405', 'Upper contour [FOAM]', 'Upper contour:Foam', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 12),
  ('2WAMC2CB0405', 'Upper contour [FOAM]', 'Upper contour:Foam', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 13),
  ('2WAMC2CB0405', 'Upper contour [FOAM]', 'Upper contour:Foam', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 14),

  ('2WAMC2CB0405', 'Dual wrap [CLOTH]', 'Dual wrap:Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 15),
  ('2WAMC2CB0405', 'Dual wrap [CLOTH]', 'Dual wrap:Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 16),
  ('2WAMC2CB0405', 'Dual wrap [CLOTH]', 'Dual wrap:Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 17),
  ('2WAMC2CB0405', 'Dual wrap [FOAM]', 'Dual wrap:Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 18),
  ('2WAMC2CB0405', 'Dual wrap [FOAM]', 'Dual wrap:Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 19),
  ('2WAMC2CB0405', 'Dual wrap [FOAM]', 'Dual wrap:Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 20),

  ('2WAMC2CB0405', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 21),
  ('2WAMC2CB0405', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 22),
  ('2WAMC2CB0405', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 23),
  ('2WAMC2CB0405', 'Mitter curtain [FOAM]', 'Mitter curtain:Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 24),
  ('2WAMC2CB0405', 'Mitter curtain [FOAM]', 'Mitter curtain:Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 25),
  ('2WAMC2CB0405', 'Mitter curtain [FOAM]', 'Mitter curtain:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 26);
