-- AVW Quoting Tool — migration 0048
-- Client instructions (2026-08-10): flag 2WAMC2CB0405 and 2WAMC2CB0405-EL as part of the
-- ongoing "Items Required (by family)" correction sweep. Their previous bundle rules (migration
-- 0027) are removed pending the corrected logic; red "FLAG" badge added in the meantime
-- (lib/catalog/pendingPartBadges.ts), same mechanism as TB3-0325/OT2-WACB2/OT2-WACB2-EL.
--
-- Already applied live via service-role delete; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('2WAMC2CB0405', '2WAMC2CB0405-EL');
