-- AVW Quoting Tool — migration 0047
-- CORRECTION (client instructions, 2026-08-10): same three-stage fix as migration 0046,
-- applied to W1MM5 and OT2-W1MM5-EL (Mini family — Wrap [CLOTH/NEOGLIDE] + Mini miter
-- [CLOTH/FOAM]). Cores unchanged (2x WA1M-72-510-5220-CORE for both, checked against the live
-- DB before replacing — already correct). Both previously had an incomplete rule missing Black
-- entirely (only Blue/Red) — now corrected to the full 3-colour choice within each material.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('W1MM5', 'OT2-W1MM5-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('W1MM5', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('W1MM5', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('W1MM5', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 3),
  ('W1MM5', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 4),
  ('W1MM5', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 5),
  ('W1MM5', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 6),
  ('W1MM5', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 7),
  ('W1MM5', 'Mini miter [CLOTH]', 'Mini miter:Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 8),
  ('W1MM5', 'Mini miter [CLOTH]', 'Mini miter:Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 9),
  ('W1MM5', 'Mini miter [CLOTH]', 'Mini miter:Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 10),
  ('W1MM5', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 11),
  ('W1MM5', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 12),
  ('W1MM5', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 13),

  ('OT2-W1MM5-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-W1MM5-EL', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-W1MM5-EL', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 3),
  ('OT2-W1MM5-EL', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 4),
  ('OT2-W1MM5-EL', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 5),
  ('OT2-W1MM5-EL', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 6),
  ('OT2-W1MM5-EL', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 7),
  ('OT2-W1MM5-EL', 'Mini miter [CLOTH]', 'Mini miter:Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 8),
  ('OT2-W1MM5-EL', 'Mini miter [CLOTH]', 'Mini miter:Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 9),
  ('OT2-W1MM5-EL', 'Mini miter [CLOTH]', 'Mini miter:Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 10),
  ('OT2-W1MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 11),
  ('OT2-W1MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 12),
  ('OT2-W1MM5-EL', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 13);
