-- AVW Quoting Tool — migration 0025
-- More Top Washers (EQ-FRIC-005A) bundle rules, from client instructions (2026-08-08).
-- Requires migration 0024 (choice_subgroup column) to already be applied.
--
-- 1) OT2-MM5-R-EL-0818 — same Mini Mitter family as OT2-MM5-R-0818 (migration 0023): no core,
--    3-colour choice (Black/Blue/Red), all 42x. Added as a new picker option (sort_order 13).
--
-- 2) Top Brush family (TR1105-0325, TR1105-EL-0325, OT2-TR5, OT2-TR5-EL) — first bundle rules
--    to use a genuinely TWO-STAGE choice: the client wants "Top Brush (Foam)" or "Top Brush
--    (Drycloth)" resolved FIRST, before the colour options for whichever material was picked.
--    This is what the new choice_subgroup column is for — rows sharing a choice_group but
--    different choice_subgroup values now trigger a "choose a material" prompt first
--    (MultiPartPicker.tsx), then the normal colour prompt scoped to that subgroup.
--    Each of the 4 triggers: 1x core (TR1HB-82 for the single-arm TR1105 pair, TR3HB-82 for the
--    dual-arm TR5/OT2-TR5 pair) + Foam colours (Black/Blue/Red, 1x each) + Drycloth colours
--    (Blue/Grey, 1x each — only 2 options, not 3, for Drycloth). TR1105-0325 and TR1105-EL-0325
--    were not in the picker's option list yet (added, sort_order 14-15); OT2-TR5/OT2-TR5-EL
--    were already selectable.
--
-- 3) TR4 and TR4-EL — explicitly EXCLUDED per client instruction ("not yet clean on the logic
--    for them"). No bundle rule added. Flagged instead with a red "FLAG" badge in the picker
--    (lib/catalog/pendingPartBadges.ts), same mechanism as the earlier TBD/REVIEW badges.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

-- New picker options
delete from equipment_options
where item_id = (select id from equipment_items where sku = 'EQ-FRIC-005A')
  and option_value in ('OT2-MM5-R-EL-0818', 'TR1105-0325', 'TR1105-EL-0325');

insert into equipment_options (item_id, option_key, option_label, option_value, sort_order)
select id, 'top_washers_parts', v.part_number, v.part_number, v.ord
from equipment_items, (values
  ('OT2-MM5-R-EL-0818', 13), ('TR1105-0325', 14), ('TR1105-EL-0325', 15)
) as v(part_number, ord)
where sku = 'EQ-FRIC-005A';

-- Bundle rules
delete from part_bundle_rules where trigger_part_number in
  ('OT2-MM5-R-EL-0818', 'TR1105-0325', 'TR1105-EL-0325', 'OT2-TR5', 'OT2-TR5-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-MM5-R-EL-0818', 'Mini miter [FOAM/MICROFIBER]', null, 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 1),
  ('OT2-MM5-R-EL-0818', 'Mini miter [FOAM/MICROFIBER]', null, 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 2),
  ('OT2-MM5-R-EL-0818', 'Mini miter [FOAM/MICROFIBER]', null, 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 3),

  ('TR1105-0325', null, null, null, 'TR1HB-82', 1, 1),
  ('TR1105-0325', 'Top brush [FOAM]', 'Foam', 'Black', 'TR1-BUN-BLACK', 1, 2),
  ('TR1105-0325', 'Top brush [FOAM]', 'Foam', 'Blue', 'TR1-BUN-BLUE', 1, 3),
  ('TR1105-0325', 'Top brush [FOAM]', 'Foam', 'Red', 'TR1-BUN-RED', 1, 4),
  ('TR1105-0325', 'Top brush [DRYCLOTH]', 'Drycloth', 'Blue', 'TR5HA-DRYSOFT-CL-BL', 1, 5),
  ('TR1105-0325', 'Top brush [DRYCLOTH]', 'Drycloth', 'Grey', 'TR5HA-DRYSOFT-CL-GREY', 1, 6),

  ('TR1105-EL-0325', null, null, null, 'TR1HB-82', 1, 1),
  ('TR1105-EL-0325', 'Top brush [FOAM]', 'Foam', 'Black', 'TR1-BUN-BLACK', 1, 2),
  ('TR1105-EL-0325', 'Top brush [FOAM]', 'Foam', 'Blue', 'TR1-BUN-BLUE', 1, 3),
  ('TR1105-EL-0325', 'Top brush [FOAM]', 'Foam', 'Red', 'TR1-BUN-RED', 1, 4),
  ('TR1105-EL-0325', 'Top brush [DRYCLOTH]', 'Drycloth', 'Blue', 'TR5HA-DRYSOFT-CL-BL', 1, 5),
  ('TR1105-EL-0325', 'Top brush [DRYCLOTH]', 'Drycloth', 'Grey', 'TR5HA-DRYSOFT-CL-GREY', 1, 6),

  ('OT2-TR5', null, null, null, 'TR3HB-82', 1, 1),
  ('OT2-TR5', 'Top brush [FOAM]', 'Foam', 'Black', 'TR1-BUN-BLACK', 1, 2),
  ('OT2-TR5', 'Top brush [FOAM]', 'Foam', 'Blue', 'TR1-BUN-BLUE', 1, 3),
  ('OT2-TR5', 'Top brush [FOAM]', 'Foam', 'Red', 'TR1-BUN-RED', 1, 4),
  ('OT2-TR5', 'Top brush [DRYCLOTH]', 'Drycloth', 'Blue', 'TR5HA-DRYSOFT-CL-BL', 1, 5),
  ('OT2-TR5', 'Top brush [DRYCLOTH]', 'Drycloth', 'Grey', 'TR5HA-DRYSOFT-CL-GREY', 1, 6),

  ('OT2-TR5-EL', null, null, null, 'TR3HB-82', 1, 1),
  ('OT2-TR5-EL', 'Top brush [FOAM]', 'Foam', 'Black', 'TR1-BUN-BLACK', 1, 2),
  ('OT2-TR5-EL', 'Top brush [FOAM]', 'Foam', 'Blue', 'TR1-BUN-BLUE', 1, 3),
  ('OT2-TR5-EL', 'Top brush [FOAM]', 'Foam', 'Red', 'TR1-BUN-RED', 1, 4),
  ('OT2-TR5-EL', 'Top brush [DRYCLOTH]', 'Drycloth', 'Blue', 'TR5HA-DRYSOFT-CL-BL', 1, 5),
  ('OT2-TR5-EL', 'Top brush [DRYCLOTH]', 'Drycloth', 'Grey', 'TR5HA-DRYSOFT-CL-GREY', 1, 6);
