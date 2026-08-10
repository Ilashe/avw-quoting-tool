-- AVW Quoting Tool — migration 0044
-- CORRECTION (client instructions, 2026-08-10): naming fix, not a structural one — "anywhere
-- you see DRYCLOTH use CLOTH instead". Applies to every Top Brush bundle rule built in
-- migration 0025 (TR1105-0325, TR1105-EL-0325, OT2-TR5, OT2-TR5-EL) — all 4 shared the exact
-- same "Top brush [DRYCLOTH]" choice_group / "Drycloth" choice_subgroup, renamed here to
-- "Top brush [CLOTH]" / "Cloth". No other data touched — parts, quantities (1x each), the
-- Foam/Cloth two-stage material choice, and each item's existing core (TR1HB-82 for the
-- TR1105 pair, TR3HB-82 for the TR5 pair — both already correctly present before this change)
-- all stay exactly as they were.
--
-- Already applied live via service-role update; this file is the re-runnable historical record.

update part_bundle_rules
set choice_group = 'Top brush [CLOTH]', choice_subgroup = 'Cloth'
where choice_group = 'Top brush [DRYCLOTH]';
