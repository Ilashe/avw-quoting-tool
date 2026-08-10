-- AVW Quoting Tool — migration 0035
-- Client instructions (2026-08-10): flag TB3-0325 as part of the "Items Required (by family)"
-- logic correction sweep. Its previous bundle rule (2x TB1ADEA-4B-008-104-FTHR-PE-AVW,
-- migration 0021's [DIRECT] pattern) is removed pending the corrected logic; red "FLAG" badge
-- added in the meantime (lib/catalog/pendingPartBadges.ts), same mechanism as TR4/TR4-EL/
-- OT2-WC3-EL/OT2-WACB2/OT2-WACB2-EL.
--
-- Note: TB2-0325, TB2-EL-0325, and TB3-EL-0325 (migrations 0021/0022) share this exact same
-- [DIRECT] bundle shape and were built from the same original sheet read — they may need the
-- same treatment, but weren't touched here since the client named only TB3-0325 explicitly.
--
-- Already applied live via service-role delete; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'TB3-0325';
