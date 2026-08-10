-- AVW Quoting Tool — migration 0046
-- CORRECTION (client instructions, 2026-08-10): OT2-WC3, OT2-WC3-EL, OT2-2WAMC2, and W1MM5 all
-- need a genuinely new capability — a THIRD prompt stage. Each of these combines a Wrap/Dual
-- wrap family AND a Mitter/Mini-miter curtain family, and each family has its own different
-- materials (Wrap: Cloth or NeoGlide; Mitter curtain: Cloth or Foam/Microfiber). The flow is:
-- pick a category (Wrap vs Mitter curtain) -> pick a material within that category -> pick a
-- colour. Implemented in MultiPartPicker.tsx by overloading choice_subgroup as an optional
-- "Category:Material" compound string (parseSubgroup) — no new DB column needed. Every
-- existing two-stage rule (CB0405, Top Brush, etc.) has a plain non-colon subgroup, so this is
-- a pure addition with zero effect on anything already built.
--
-- OT2-WC3-EL was flagged (FLAG badge) since migration 0026 due to an unexplained extra part in
-- its original sheet row — now resolved with the client's confirmed family data. Badge removed.
--
-- Cores unchanged for all 4 (checked against the live DB before replacing, all were already
-- correctly present): OT2-WC3/OT2-WC3-EL 2x WA1M-72-510-5220-CORE, OT2-2WAMC2 4x (dual),
-- W1MM5 2x. Wrap/Dual-wrap colours match their own core's "single"/"dual" quantity (2x/4x);
-- Mitter curtain = 42x/63x (Regular/Full-style), Mini miter = 28x/42x (Mini-style) — matching
-- the conventions already established for the plain Mitter/Mini-miter corrections.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('OT2-WC3', 'OT2-WC3-EL', 'OT2-2WAMC2', 'W1MM5');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  -- OT2-WC3 (core 2x)
  ('OT2-WC3', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WC3', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-WC3', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 3),
  ('OT2-WC3', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 4),
  ('OT2-WC3', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 5),
  ('OT2-WC3', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 6),
  ('OT2-WC3', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 7),
  ('OT2-WC3', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 8),
  ('OT2-WC3', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 9),
  ('OT2-WC3', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 10),
  ('OT2-WC3', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 11),
  ('OT2-WC3', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 12),
  ('OT2-WC3', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 13),

  -- OT2-WC3-EL (core 2x) — identical shape to OT2-WC3
  ('OT2-WC3-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WC3-EL', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-WC3-EL', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 3),
  ('OT2-WC3-EL', 'Wrap [CLOTH]', 'Wrap:Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 4),
  ('OT2-WC3-EL', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 5),
  ('OT2-WC3-EL', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 6),
  ('OT2-WC3-EL', 'Wrap [NEOGLIDE]', 'Wrap:NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 7),
  ('OT2-WC3-EL', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 8),
  ('OT2-WC3-EL', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 9),
  ('OT2-WC3-EL', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 10),
  ('OT2-WC3-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 11),
  ('OT2-WC3-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 12),
  ('OT2-WC3-EL', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 13),

  -- OT2-2WAMC2 (core 4x, dual)
  ('OT2-2WAMC2', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('OT2-2WAMC2', 'Dual wrap [CLOTH]', 'Dual wrap:Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 2),
  ('OT2-2WAMC2', 'Dual wrap [CLOTH]', 'Dual wrap:Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 3),
  ('OT2-2WAMC2', 'Dual wrap [CLOTH]', 'Dual wrap:Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 4),
  ('OT2-2WAMC2', 'Dual wrap [NEOGLIDE]', 'Dual wrap:NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 5),
  ('OT2-2WAMC2', 'Dual wrap [NEOGLIDE]', 'Dual wrap:NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 6),
  ('OT2-2WAMC2', 'Dual wrap [NEOGLIDE]', 'Dual wrap:NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 7),
  ('OT2-2WAMC2', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 8),
  ('OT2-2WAMC2', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 9),
  ('OT2-2WAMC2', 'Mitter curtain [CLOTH]', 'Mitter curtain:Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 10),
  ('OT2-2WAMC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 11),
  ('OT2-2WAMC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 12),
  ('OT2-2WAMC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Mitter curtain:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 13),

  -- W1MM5 (core 2x, Mini family)
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
  ('W1MM5', 'Mini miter [FOAM/MICROFIBER]', 'Mini miter:Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 13);
