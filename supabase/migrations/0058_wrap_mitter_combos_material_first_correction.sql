-- AVW Quoting Tool — migration 0058
-- CORRECTION (client instructions, 2026-08-10): migration 0046/0047's three-stage "pick a
-- category first (Wrap vs Mitter curtain), then material, then colour" flow for OT2-WC3,
-- OT2-WC3-EL, OT2-2WAMC2, W1MM5, and OT2-W1MM5-EL was wrong — a misreading of the client's
-- instructions. Correct flow: material FIRST (Cloth or Foam), then colour — and that single
-- material+colour choice adds parts from EVERY family together (Wrap AND Mitter curtain, both),
-- not just one. Client, verbatim: "you are to walk all through the family... Cloth or foam is
-- the prompt followed by colour and you did select the (cloth or foam) colour from all the
-- family." This only became buildable after migration 0056 unified the NeoGlide/Foam labeling —
-- before that, Wrap used "NeoGlide" and Mitter curtain used "Foam/Microfiber", two different
-- words, which is presumably why the original (wrong) three-stage split happened.
--
-- Same architecture as CB0405/WACB2/WACB0405: two-stage choice (material, then colour), each
-- colour resolving to MULTIPLE required_part_number rows sharing one (choice_group, choice_label)
-- — one row per family. No third "family" prompt stage needed; MultiPartPicker.tsx's existing
-- pendingFamily logic is simply unused by these triggers now (kept in the component for any
-- future part that genuinely needs a mutually-exclusive category choice).
--
-- Cores unchanged for all 5 (already correct, untouched by this correction): OT2-WC3/OT2-WC3-EL
-- 2x WA1M-72-510-5220-CORE, OT2-2WAMC2 4x (dual), W1MM5/OT2-W1MM5-EL 2x. Part numbers and
-- quantities per family unchanged from 0046/0047 (Wrap/Dual wrap = 2x/4x matching the core;
-- Mitter curtain = 42x Cloth / 63x Foam; Mini miter = 28x Cloth / 42x Foam) — only the choice
-- structure (material-first, multi-part-per-choice) and the group labels changed.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in
  ('OT2-WC3', 'OT2-WC3-EL', 'OT2-2WAMC2', 'W1MM5', 'OT2-W1MM5-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  -- OT2-WC3 (core 2x; Wrap 2x + Mitter curtain 42x/63x)
  ('OT2-WC3', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WC3', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-WC3', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 3),
  ('OT2-WC3', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 4),
  ('OT2-WC3', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 5),
  ('OT2-WC3', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 6),
  ('OT2-WC3', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 7),
  ('OT2-WC3', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 8),
  ('OT2-WC3', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 9),
  ('OT2-WC3', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 10),
  ('OT2-WC3', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 11),
  ('OT2-WC3', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 12),
  ('OT2-WC3', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 13),

  -- OT2-WC3-EL — identical shape to OT2-WC3
  ('OT2-WC3-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-WC3-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-WC3-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 3),
  ('OT2-WC3-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 4),
  ('OT2-WC3-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 5),
  ('OT2-WC3-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 6),
  ('OT2-WC3-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 7),
  ('OT2-WC3-EL', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 8),
  ('OT2-WC3-EL', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 9),
  ('OT2-WC3-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 10),
  ('OT2-WC3-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 11),
  ('OT2-WC3-EL', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 12),
  ('OT2-WC3-EL', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 13),

  -- OT2-2WAMC2 (core 4x, dual; Dual wrap 4x + Mitter curtain 42x/63x)
  ('OT2-2WAMC2', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('OT2-2WAMC2', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 2),
  ('OT2-2WAMC2', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 3),
  ('OT2-2WAMC2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 4),
  ('OT2-2WAMC2', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 5),
  ('OT2-2WAMC2', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 6),
  ('OT2-2WAMC2', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 7),
  ('OT2-2WAMC2', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 8),
  ('OT2-2WAMC2', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 9),
  ('OT2-2WAMC2', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 10),
  ('OT2-2WAMC2', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 11),
  ('OT2-2WAMC2', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 12),
  ('OT2-2WAMC2', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 13),

  -- W1MM5 (core 2x, Mini family; Wrap 2x + Mini miter 28x/42x)
  ('W1MM5', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('W1MM5', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('W1MM5', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 3),
  ('W1MM5', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 4),
  ('W1MM5', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 5),
  ('W1MM5', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 6),
  ('W1MM5', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 7),
  ('W1MM5', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 8),
  ('W1MM5', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 9),
  ('W1MM5', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 10),
  ('W1MM5', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 11),
  ('W1MM5', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 12),
  ('W1MM5', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 13),

  -- OT2-W1MM5-EL — identical shape to W1MM5
  ('OT2-W1MM5-EL', null, null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('OT2-W1MM5-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 2, 2),
  ('OT2-W1MM5-EL', 'Combo [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 28, 3),
  ('OT2-W1MM5-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 2, 4),
  ('OT2-W1MM5-EL', 'Combo [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 28, 5),
  ('OT2-W1MM5-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 2, 6),
  ('OT2-W1MM5-EL', 'Combo [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 28, 7),
  ('OT2-W1MM5-EL', 'Combo [FOAM]', 'Foam', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 2, 8),
  ('OT2-W1MM5-EL', 'Combo [FOAM]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 42, 9),
  ('OT2-W1MM5-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 2, 10),
  ('OT2-W1MM5-EL', 'Combo [FOAM]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 42, 11),
  ('OT2-W1MM5-EL', 'Combo [FOAM]', 'Foam', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 2, 12),
  ('OT2-W1MM5-EL', 'Combo [FOAM]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 42, 13);
