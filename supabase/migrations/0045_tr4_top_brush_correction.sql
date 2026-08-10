-- AVW Quoting Tool — migration 0045
-- CORRECTION (client instructions, 2026-08-10): TR4 and TR4-EL were flagged (FLAG badge) back
-- in migration 0025 because their Cloth/Foam family data was unclear at the time — but their
-- core (1x TR3HB-82) WAS clearly given in the original sheet, same as their "Top Brush – Dual
-- Arm" siblings OT2-TR5/OT2-TR5-EL. Client has now confirmed the family logic is identical to
-- the other Top Brush items: Foam (Black/Blue/Red, 1x each) or Cloth (Blue/Grey, 1x each — the
-- DRYCLOTH->CLOTH rename from migration 0044 applies here directly, no separate rename needed
-- since these rules are newly created with the correct name already).
--
-- FLAG badges removed for both (lib/catalog/pendingPartBadges.ts) — real logic is in.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('TR4', 'TR4-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('TR4', null, null, null, 'TR3HB-82', 1, 1),
  ('TR4', 'Top brush [FOAM]', 'Foam', 'Black', 'TR1-BUN-BLACK', 1, 2),
  ('TR4', 'Top brush [FOAM]', 'Foam', 'Blue', 'TR1-BUN-BLUE', 1, 3),
  ('TR4', 'Top brush [FOAM]', 'Foam', 'Red', 'TR1-BUN-RED', 1, 4),
  ('TR4', 'Top brush [CLOTH]', 'Cloth', 'Blue', 'TR5HA-DRYSOFT-CL-BL', 1, 5),
  ('TR4', 'Top brush [CLOTH]', 'Cloth', 'Grey', 'TR5HA-DRYSOFT-CL-GREY', 1, 6),

  ('TR4-EL', null, null, null, 'TR3HB-82', 1, 1),
  ('TR4-EL', 'Top brush [FOAM]', 'Foam', 'Black', 'TR1-BUN-BLACK', 1, 2),
  ('TR4-EL', 'Top brush [FOAM]', 'Foam', 'Blue', 'TR1-BUN-BLUE', 1, 3),
  ('TR4-EL', 'Top brush [FOAM]', 'Foam', 'Red', 'TR1-BUN-RED', 1, 4),
  ('TR4-EL', 'Top brush [CLOTH]', 'Cloth', 'Blue', 'TR5HA-DRYSOFT-CL-BL', 1, 5),
  ('TR4-EL', 'Top brush [CLOTH]', 'Cloth', 'Grey', 'TR5HA-DRYSOFT-CL-GREY', 1, 6);
