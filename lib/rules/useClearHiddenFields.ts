'use client'

import { useEffect } from 'react'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useSelectionsStore } from '@/store/selectionsStore'
import { isFieldVisible } from './engine'

/**
 * Selections left behind after a trigger flips a field back out of view (e.g. Sidewashers -> No
 * after parts were picked) would otherwise keep contributing to computeQuoteTotal, which has no
 * visibility awareness of its own — SummaryPanel's displayed rows filter by isFieldVisible, but
 * the total doesn't. Clearing hidden fields here, at the one place values are mutated, keeps
 * every consumer (SummaryPanel, TopBar, the persisted quotes.total_value) correct without
 * threading rules/items through each of them. Mount once near the top of the configurator.
 */
export function useClearHiddenFields() {
  const { items, rules } = useEquipmentCatalog(null)
  const values = useSelectionsStore((s) => s.values)
  const setField = useSelectionsStore((s) => s.setField)

  useEffect(() => {
    if (items.length === 0) return
    for (const item of items) {
      const fieldKey = item.metadata.field_key
      const value = values[fieldKey]
      if (value === null || value === undefined || value === '') continue
      if (!isFieldVisible(rules, values, fieldKey)) {
        setField(fieldKey, null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, rules, values])
}
