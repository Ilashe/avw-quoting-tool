'use client'

import { useEffect } from 'react'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useSelectionsStore } from '@/store/selectionsStore'
import { getForcedValue } from './engine'

/**
 * Applies dependency_rules' set_value rows to the store — e.g. Flight Spacing Details deriving
 * its text from whatever Flight Size is picked. getForcedValue already existed in engine.ts but
 * had never been wired into any component; this is the generic wiring, not specific to any one
 * field, so a future auto-populated field only needs a new set_value rule row. Mount once near
 * the top of the configurator, alongside useClearHiddenFields.
 */
export function useApplyForcedValues() {
  const { items, rules } = useEquipmentCatalog(null)
  const values = useSelectionsStore((s) => s.values)
  const setField = useSelectionsStore((s) => s.setField)

  useEffect(() => {
    if (items.length === 0) return
    for (const item of items) {
      const fieldKey = item.metadata.field_key
      const forced = getForcedValue(rules, values, fieldKey)
      if (forced !== null && values[fieldKey] !== forced) {
        setField(fieldKey, forced)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, rules, values])
}
