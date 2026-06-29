'use client'

import { useMemo } from 'react'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useSelectionsStore } from '@/store/selectionsStore'
import { isFieldVisible, getExcludedOptionValues } from '@/lib/rules/engine'
import SectionAccordion from '../SectionAccordion'
import CatalogField, { EMPTY_OPTIONS } from '../CatalogField'

export default function BackroomTab() {
  const { categories, items, options, rules, loading, error } = useEquipmentCatalog('backroom')
  const values = useSelectionsStore((s) => s.values)

  const optionsByItemId = useMemo(() => {
    const map = new Map<string, typeof options>()
    for (const option of options) {
      const list = map.get(option.item_id)
      if (list) list.push(option)
      else map.set(option.item_id, [option])
    }
    return map
  }, [options])

  if (loading) return <p className="text-sm text-slate-500">Loading backroom catalog…</p>
  if (error) return <p className="text-sm text-red-600">Couldn&apos;t load the backroom catalog: {error}</p>

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryItems = items
          .filter((item) => item.category_id === category.id)
          .sort((a, b) => a.sku.localeCompare(b.sku))

        const allFilled = categoryItems.every((item) => {
          const fk = item.metadata.field_key
          if (!isFieldVisible(rules, values, fk)) return true
          if (item.metadata.widget === 'pending') return true
          const v = values[fk]
          return v !== null && v !== undefined && v !== ''
        })

        return (
          <SectionAccordion key={category.id} title={category.display_name} allFilled={allFilled}>
            {categoryItems.map((item) => {
              const fieldKey = item.metadata.field_key
              const visible = isFieldVisible(rules, values, fieldKey)
              const excludedOptionsKey = Array.from(getExcludedOptionValues(rules, values, fieldKey))
                .sort()
                .join(',')

              return (
                <CatalogField
                  key={item.id}
                  item={item}
                  options={optionsByItemId.get(item.id) ?? EMPTY_OPTIONS}
                  visible={visible}
                  excludedOptionsKey={excludedOptionsKey}
                />
              )
            })}
          </SectionAccordion>
        )
      })}
    </div>
  )
}
