-- AVW Quoting Tool — migration 0051
-- CORRECTION (client instructions, 2026-08-10): DWA1 and OT2-DWA1-EL were built in migration
-- 0029 as a single [DIRECT] item (1x WA1M-00-510-5220-SS-NG-RD, no choice) — wrong. Real logic:
-- core unchanged (4x WA1M-72-510-5220-CORE, checked against the live DB before replacing —
-- already correct), then a genuine Cloth-or-NeoGlide material choice, then Black/Blue/Red, all
-- at 4x (matching the "dual" core quantity, same convention as Dual wrap in migration 0046/
-- 0047). No badges to remove — neither was ever flagged.
--
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('DWA1', 'OT2-DWA1-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order)
values
  ('DWA1', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('DWA1', 'Dual wrap [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 2),
  ('DWA1', 'Dual wrap [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 3),
  ('DWA1', 'Dual wrap [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 4),
  ('DWA1', 'Dual wrap [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 5),
  ('DWA1', 'Dual wrap [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 6),
  ('DWA1', 'Dual wrap [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 7),

  ('OT2-DWA1-EL', null, null, null, 'WA1M-72-510-5220-CORE', 4, 1),
  ('OT2-DWA1-EL', 'Dual wrap [CLOTH]', 'Cloth', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 4, 2),
  ('OT2-DWA1-EL', 'Dual wrap [CLOTH]', 'Cloth', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 4, 3),
  ('OT2-DWA1-EL', 'Dual wrap [CLOTH]', 'Cloth', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 4, 4),
  ('OT2-DWA1-EL', 'Dual wrap [NEOGLIDE]', 'NeoGlide', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 4, 5),
  ('OT2-DWA1-EL', 'Dual wrap [NEOGLIDE]', 'NeoGlide', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 4, 6),
  ('OT2-DWA1-EL', 'Dual wrap [NEOGLIDE]', 'NeoGlide', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 4, 7);
