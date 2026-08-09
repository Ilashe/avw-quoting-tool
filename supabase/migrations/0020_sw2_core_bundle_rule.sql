-- AVW Quoting Tool — migration 0020
-- Fifth/sixth "part bundle" rule (see 0017 for the mechanism), from client instructions
-- (2026-08-07): SW2 and SW2-EL (Side Washers, "Side Washer-Free Standing") each need
-- 2x WA1M-72-510-5220-CORE (core, decided/priced). The "Cloth/Foam Items Required (by family)"
-- colour parts (SW1M-00-510-5220-SS-NG-BL / -RD) are explicitly "TBD - color/material not yet
-- in system" per the client's own notes — neither part exists in `parts` yet — so NO
-- choice-group rows are added here. Only the core requirement is wired up; the colour choice
-- is deferred until the client finalizes it. In the meantime the SW2/SW2-EL thumbnails in the
-- picker show a red "TBD" badge (code-level flag, not DB-driven — see
-- lib/catalog/pendingPartBadges.ts) so sales reps know that part of the family isn't final.
-- Pure data on the existing part_bundle_rules table; no schema change.
-- Already applied live via service-role insert; this file is the re-runnable historical record.

delete from part_bundle_rules where trigger_part_number in ('SW2', 'SW2-EL');

insert into part_bundle_rules (trigger_part_number, choice_group, choice_label, required_part_number, quantity, sort_order)
values
  ('SW2', null, null, 'WA1M-72-510-5220-CORE', 2, 1),
  ('SW2-EL', null, null, 'WA1M-72-510-5220-CORE', 2, 1);
