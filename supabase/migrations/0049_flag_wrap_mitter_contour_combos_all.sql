-- AVW Quoting Tool — migration 0049
-- Client instructions (2026-08-10): flag EVERY item in Wrap Mitter Contour Combos as part of
-- the ongoing "Items Required (by family)" correction sweep — extends migration 0048
-- (2WAMC2CB0405, 2WAMC2CB0405-EL already flagged) to the remaining 6: 2WAMC2CB2, 2WAMC2CB2-EL,
-- OT2-WC3CB2, OT2-WC3CB2-EL, OT2-WC3CB0405, OT2-WC3CB0405-EL. All bundle rules built in
-- migration 0027 for these 6 are removed pending corrected logic; red "FLAG" badge added for
-- all in the meantime (lib/catalog/pendingPartBadges.ts). Every part in this field's picker is
-- now flagged (all 8).
--
-- Already applied live via service-role delete; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in
  ('2WAMC2CB2', '2WAMC2CB2-EL', 'OT2-WC3CB2', 'OT2-WC3CB2-EL', 'OT2-WC3CB0405', 'OT2-WC3CB0405-EL');
