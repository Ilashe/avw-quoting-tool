-- AVW Quoting Tool — migration 0036
-- CORRECTION (client instructions, 2026-08-10): OT2-MC2's original bundle rule (migration
-- 0023) only offered "Mitter curtain [FOAM/MICROFIBER]" (asymmetric Black=1x/Blue=63x/Red=63x)
-- with no Cloth option — wrong. Real logic: a material choice — Cloth or Foam/Microfiber —
-- then Black/Blue/Red within it. No core row: migration 0023 explicitly recorded "Core Items
-- Required = None" for this item, and the client's corrected family text doesn't mention one
-- either — an earlier version of this migration wrongly added a WA1M-72-510-5220-CORE core row
-- by pattern-matching against unrelated items (Side Washers/Wrap Mitter Combos) that do have
-- that core; caught and removed same-day. Unlike the CB0405/CB2 correction, this one stays
-- single-part-per-choice (no lower/upper split); the two families just have different uniform
-- quantities: Cloth = 42x all 3 colours, Foam/Microfiber = 63x all 3 colours (no more
-- Black-unprefixed-1x asymmetry either).
--
-- Client confirmed the trigger is OT2-MC2 (typed "MT2-MC2" first, a typo — the existing bundle
-- rule for OT2-MC2 matched exactly what was described as wrong, confirming the part).
--
-- MC1E-12W79L-S-CL-AVW-RD didn't exist in `parts` yet — added from Items (7).xlsx. OT2-MC2 was
-- never flagged — no badge to remove.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'OT2-MC2';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('OT2-MC2', 'Mitter curtain [CLOTH]', 'Cloth', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 42, 1),
  ('OT2-MC2', 'Mitter curtain [CLOTH]', 'Cloth', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 42, 2),
  ('OT2-MC2', 'Mitter curtain [CLOTH]', 'Cloth', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 42, 3),
  ('OT2-MC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Foam', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 63, 4),
  ('OT2-MC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Foam', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 63, 5),
  ('OT2-MC2', 'Mitter curtain [FOAM/MICROFIBER]', 'Foam', 'Red', 'MC1E-04W79L-S-MFBR-RED', 63, 6);
