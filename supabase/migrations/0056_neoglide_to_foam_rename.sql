-- AVW Quoting Tool — migration 0056
-- Client instructions (2026-08-10): "any where that we might have used Neoglide, change it to
-- Foam, they are actually the same but for uniformity lets use FOAM instead of neoglide in some
-- and foam in some." Text-only rename across every existing part_bundle_rules row — no part
-- numbers, quantities, cores, or colours touched, only the displayed material label:
--   choice_subgroup: 'NeoGlide' -> 'Foam' (covers both plain two-stage values like CB0405's
--     'NeoGlide', and the three-stage compound values like OT2-WC3's 'Wrap:NeoGlide' ->
--     'Wrap:Foam' — replace() matches the substring either way).
--   choice_group: '[NEOGLIDE]' -> '[FOAM]' (e.g. "Contour [NEOGLIDE]" -> "Contour [FOAM]"), and
--     '[FOAM/MICROFIBER]' -> '[FOAM]' (e.g. "Mitter curtain [FOAM/MICROFIBER]" -> "Mitter
--     curtain [FOAM]") — the client's point was that BOTH labels existed for the same underlying
--     material and that's the inconsistency to fix, not just the NeoGlide spelling.
-- Affects (as of this migration): CB0405, CB0405-EL, CB2, CB2-EL, DWA1, OT2-DWA1-EL, OT2-WA4,
-- OT2-WA4-EL, OT2-WACB2, OT2-WACB2-EL, OT2-WACB0405, OT2-WACB0405-EL, OT2-WC3, OT2-WC3-EL,
-- OT2-2WAMC2, W1MM5, OT2-W1MM5-EL. Applied table-wide (not filtered by trigger) so it also
-- covers any future correction that used either label before this migration ran.
--
-- Already applied live via service-role update; this file is the re-runnable historical record.

update part_bundle_rules
set
  choice_subgroup = replace(choice_subgroup, 'NeoGlide', 'Foam'),
  choice_group = replace(replace(choice_group, '[NEOGLIDE]', '[FOAM]'), '[FOAM/MICROFIBER]', '[FOAM]')
where choice_subgroup like '%NeoGlide%'
   or choice_group like '%NEOGLIDE%'
   or choice_group like '%FOAM/MICROFIBER%';
