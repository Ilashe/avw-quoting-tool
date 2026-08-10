-- AVW Quoting Tool — migration 0033
-- CORRECTION (client instructions, 2026-08-10): same fix as migration 0032, applied to
-- CB0405-EL. Identical family structure to CB0405 — core unchanged (2x CB0405AMC-23-13, 2x
-- CB0405AMC-50-13), then CLOTH or NEOGLIDE material choice, then Black/Blue/Red colour, adding
-- both the lower-contour and upper-contour brush together, all qty 2. All 12 parts already
-- exist (added in migration 0032). No badge to remove — CB0405-EL was never flagged.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'CB0405-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('CB0405-EL', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('CB0405-EL', null, null, null, 'CB0405AMC-50-13', 2, 2),

  ('CB0405-EL', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 3),
  ('CB0405-EL', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 4),
  ('CB0405-EL', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 5),
  ('CB0405-EL', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 6),
  ('CB0405-EL', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 7),
  ('CB0405-EL', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 8),

  ('CB0405-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 9),
  ('CB0405-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 10),
  ('CB0405-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 11),
  ('CB0405-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 12),
  ('CB0405-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 13),
  ('CB0405-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 14);
