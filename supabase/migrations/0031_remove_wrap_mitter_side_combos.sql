-- AVW Quoting Tool — migration 0031
-- Client instructions (2026-08-09): remove "Wrap Mitter Side Combos" (EQ-FRIC-007) from the
-- Equipment tab. Still a "pending" placeholder ("Waiting for Scott"), never built out — same
-- reasoning as migration 0030 (Combos, What Type of Cloth).
--
-- Soft-deleted via is_active = false (useEquipmentCatalog filters on is_active = true), not a
-- hard delete — reversible; re-run with is_active = true to bring it back.
--
-- Already applied live via service-role update; this file is the re-runnable historical record.

update equipment_items set is_active = false where sku = 'EQ-FRIC-007';
