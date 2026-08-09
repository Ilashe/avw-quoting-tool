-- AVW Quoting Tool — migration 0018
-- Second "part bundle" rule (see 0017 for the mechanism itself), from client instructions
-- (2026-08-07): CB0405-EL (Side Washers, "Free Standing Contour Brush, Electric Drive") needs
-- the exact same bundle as CB0405 — same core items, same NEOGLIDE colour choice, same
-- quantities. Pure data on the existing part_bundle_rules table; no code change.
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'CB0405-EL';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('CB0405-EL', null, null, 'CB0405AMC-23-13', 2, 1),
  ('CB0405-EL', null, null, 'CB0405AMC-50-13', 2, 2),
  ('CB0405-EL', 'NEOGLIDE colour', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 1, 3),
  ('CB0405-EL', 'NEOGLIDE colour', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 4);
