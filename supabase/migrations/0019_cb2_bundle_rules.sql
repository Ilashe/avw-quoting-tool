-- AVW Quoting Tool — migration 0019
-- Third/fourth "part bundle" rules (see 0017 for the mechanism), from client instructions
-- (2026-08-07): CB2 and CB2-EL (Side Washers, "Kaady Style" contour brushes) each need
-- 2x CB1AMC-23-13 + 2x CB1AMC-50-13 (core) — a different core-part family than CB0405/CB0405-EL
-- (CB1* not CB0405*) — then a colour choice, header "Upper Contour(NEOGLIDE)" (exact client
-- spelling, no leading "Choose a" — the modal now renders choice_group verbatim as its header,
-- see the MultiPartPicker.tsx change from the same session): Black -> 2x CB1AMA-50-13-S-NG-BK,
-- Blue -> 2x CB1AMA-50-13-S-NG-BL, Red -> 2x CB1AMA-50-13-S-NG-RD (all qty 2 this time, unlike
-- CB0405's asymmetric 1x Blue / 2x Red). Unlike the CB0405 case, "BK" genuinely does mean Black
-- here — its own description in Items (7).xlsx reads "...per brush, Black".
-- Pure data on the existing part_bundle_rules table; no code change beyond the modal header
-- template (now renders choice_group as-is, no hardcoded prefix).
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('CB2', 'CB2-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('CB2', null, null, 'CB1AMC-23-13', 2, 1),
  ('CB2', null, null, 'CB1AMC-50-13', 2, 2),
  ('CB2', 'Upper Contour(NEOGLIDE)', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 3),
  ('CB2', 'Upper Contour(NEOGLIDE)', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 4),
  ('CB2', 'Upper Contour(NEOGLIDE)', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 5),
  ('CB2-EL', null, null, 'CB1AMC-23-13', 2, 1),
  ('CB2-EL', null, null, 'CB1AMC-50-13', 2, 2),
  ('CB2-EL', 'Upper Contour(NEOGLIDE)', 'Black', 'CB1AMA-50-13-S-NG-BK', 2, 3),
  ('CB2-EL', 'Upper Contour(NEOGLIDE)', 'Blue', 'CB1AMA-50-13-S-NG-BL', 2, 4),
  ('CB2-EL', 'Upper Contour(NEOGLIDE)', 'Red', 'CB1AMA-50-13-S-NG-RD', 2, 5);
