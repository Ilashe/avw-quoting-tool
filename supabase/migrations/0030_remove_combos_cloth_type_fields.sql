-- AVW Quoting Tool — migration 0030
-- Client instructions (2026-08-09): remove "Combos" (EQ-FRIC-001) and "What Type of Cloth?"
-- (EQ-FRIC-002) from the Equipment tab. Both were still "pending" placeholders ("Waiting for
-- Scott"), never built out, and are being superseded by the individual Wrap Mitter Combos /
-- Wrap Mitter Contour Combos / Wrap Sidewasher Combos / Wraps fields built this session.
--
-- Soft-deleted via is_active = false (useEquipmentCatalog filters on is_active = true), not a
-- hard delete — reversible, and consistent with how every other "hide from the tab" case in
-- this schema works. Rows/history stay intact; re-run with is_active = true to bring back.
--
-- Already applied live via service-role update; this file is the re-runnable historical record.

update equipment_items set is_active = false where sku in ('EQ-FRIC-001', 'EQ-FRIC-002');
