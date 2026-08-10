-- AVW Quoting Tool — migration 0032
-- CORRECTION (client instructions, 2026-08-10): the "Items Required (by family)" bundle logic
-- built for CB0405 in migration 0017 was wrong. CB0405 actually has FOUR families — Lower
-- Contour [CLOTH], Lower Contour [NEOGLIDE], Upper Contour [CLOTH], Upper Contour [NEOGLIDE] —
-- not just one "NEOGLIDE colour" choice covering the upper brush alone. The real flow: after
-- core items are added, prompt CLOTH or NEOGLIDE (material), then a colour (Black/Blue/Red);
-- the chosen material+colour combination adds BOTH the lower-contour AND upper-contour brush
-- parts together, both qty 2 uniformly (no asymmetric 1x/2x quantities — that was wrong too).
--
-- This required a genuine capability the picker never had: one colour choice resolving to more
-- than one required part. MultiPartPicker.tsx's confirmChoice/BundleChoiceModal changed to
-- dedupe modal buttons by choice_label and add every part_bundle_rules row sharing that
-- (choice_group, choice_label) when picked — pure additive change, no schema/column needed,
-- and every prior single-part-per-colour rule (the vast majority) is unaffected since there's
-- only one row per label there.
--
-- Old CB0405 rule set (2 core + 1 "NEOGLIDE colour" choice, upper brush only, Blue=1x/Red=2x)
-- is fully replaced. New: 2 core (unchanged) + 2 materials x 3 colours x 2 parts (lower+upper)
-- = 12 choice rows, all qty 2. choice_group per material: "Contour [CLOTH]" / "Contour
-- [NEOGLIDE]" (covers both lower+upper under one prompt, per the client's description).
--
-- CB0405 was never flagged (TBD/REVIEW/FLAG) — no badge to remove here. Client said more parts
-- will be corrected the same way, one at a time; when a previously-flagged part gets its real
-- logic this way, remove its badge from lib/catalog/pendingPartBadges.ts in that same change.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number = 'CB0405';

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('CB0405', null, null, null, 'CB0405AMC-23-13', 2, 1),
  ('CB0405', null, null, null, 'CB0405AMC-50-13', 2, 2),

  ('CB0405', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-23-13-S-CL-BK', 2, 3),
  ('CB0405', 'Contour [CLOTH]', 'Cloth', 'Black', 'CB0405AMA-50-13-S-CL-BK', 2, 4),
  ('CB0405', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-23-13-S-CL-BL', 2, 5),
  ('CB0405', 'Contour [CLOTH]', 'Cloth', 'Blue', 'CB0405AMA-50-13-S-CL-BL', 2, 6),
  ('CB0405', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-23-13-S-CL-RD', 2, 7),
  ('CB0405', 'Contour [CLOTH]', 'Cloth', 'Red', 'CB0405AMA-50-13-S-CL-RD', 2, 8),

  ('CB0405', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-23-13-S-NG-BK', 2, 9),
  ('CB0405', 'Contour [NEOGLIDE]', 'NeoGlide', 'Black', 'CB0405AMA-50-13-S-NG-BK', 2, 10),
  ('CB0405', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-23-13-S-NG-BL', 2, 11),
  ('CB0405', 'Contour [NEOGLIDE]', 'NeoGlide', 'Blue', 'CB0405AMA-50-13-S-NG-BL', 2, 12),
  ('CB0405', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-23-13-S-NG-RD', 2, 13),
  ('CB0405', 'Contour [NEOGLIDE]', 'NeoGlide', 'Red', 'CB0405AMA-50-13-S-NG-RD', 2, 14);
