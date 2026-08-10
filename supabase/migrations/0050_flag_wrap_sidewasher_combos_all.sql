-- AVW Quoting Tool — migration 0050
-- Client instructions (2026-08-10): flag EVERY item in Wrap Sidewasher Combos as part of the
-- ongoing "Items Required (by family)" correction sweep. All bundle rules removed for all 6
-- items (OT2-WSW4, OT2-WSW4-EL, OT2-WACB2, OT2-WACB2-EL, OT2-WACB0405, OT2-WACB0405-EL —
-- including OT2-WACB0405/OT2-WACB0405-EL, which previously had a correctly-built rule from
-- migration 0028). Badge convention updated for consistency: OT2-WSW4/OT2-WSW4-EL move from
-- "TBD" to "FLAG" (lib/catalog/pendingPartBadges.ts), matching the uniform FLAG treatment used
-- for Wrap Mitter Contour Combos (migration 0049). Every part in this field's picker is now
-- flagged (all 6).
--
-- Already applied live via service-role delete; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in
  ('OT2-WSW4', 'OT2-WSW4-EL', 'OT2-WACB2', 'OT2-WACB2-EL', 'OT2-WACB0405', 'OT2-WACB0405-EL');
