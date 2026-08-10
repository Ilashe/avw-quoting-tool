-- AVW Quoting Tool — migration 0034
-- CORRECTION (client instructions, 2026-08-10): same fix as migrations 0032/0033, applied to
-- CB2 and CB2-EL ("Kaady" style contour brushes). Same family structure, CB1-prefixed parts
-- instead of CB0405-prefixed: core unchanged (2x CB1AMC-23-13, 2x CB1AMC-50-13), then CLOTH or
-- NEOGLIDE material choice, then Black/Blue/Red colour, adding both the lower-contour and
-- upper-contour brush together, all qty 2. 5 of the 12 lower/upper contour colour parts didn't
-- exist yet (CB1AMA-23-13-S-CL-RD, CB1AMA-23-13-S-NG-BK, CB1AMA-23-13-S-NG-RD,
-- CB1AMA-50-13-S-CL-BK, CB1AMA-50-13-S-CL-RD) — added from Items (7).xlsx. No badges to
-- remove — CB2/CB2-EL were never flagged.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('CB2', 'CB2-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('CB2', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('CB2', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('CB2', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 3),
  ('CB2', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 4),
  ('CB2', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 5),
  ('CB2', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 6),
  ('CB2', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 7),
  ('CB2', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 8),
  ('CB2', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 9),
  ('CB2', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 10),
  ('CB2', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 11),
  ('CB2', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 12),
  ('CB2', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 13),
  ('CB2', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 14),

  ('CB2-EL', null, null, null, 'CB1AMC-23-13', 2, 1),
  ('CB2-EL', null, null, null, 'CB1AMC-50-13', 2, 2),
  ('CB2-EL', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB1AMA-23-13-S-CL-BK', 2, 3),
  ('CB2-EL', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB1AMA-50-13-S-CL-BK', 2, 4),
  ('CB2-EL', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-23-13-S-CL-BL', 2, 5),
  ('CB2-EL', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB1AMA-50-13-S-CL-BL', 2, 6),
  ('CB2-EL', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB1AMA-23-13-S-CL-RD', 2, 7),
  ('CB2-EL', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB1AMA-50-13-S-CL-RD', 2, 8),
  ('CB2-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-23-13-S-NG-BK', 2, 9),
  ('CB2-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 10),
  ('CB2-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-23-13-S-NG-BL', 2, 11),
  ('CB2-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 12),
  ('CB2-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-23-13-S-NG-RD', 2, 13),
  ('CB2-EL', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 14);
