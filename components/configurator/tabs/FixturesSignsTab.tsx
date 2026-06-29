'use client'

import { useMemo } from 'react'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useSelectionsStore } from '@/store/selectionsStore'
import { isFieldVisible, getExcludedOptionValues } from '@/lib/rules/engine'
import CatalogField, { EMPTY_OPTIONS } from '../CatalogField'

export default function FixturesSignsTab() {
  const { categories, items, options, rules, loading, error } = useEquipmentCatalog('fixtures_signs')
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

  if (loading) return <p className="text-sm text-slate-500">Loading fixtures &amp; signs catalog…</p>
  if (error) return <p className="text-sm text-red-600">Couldn&apos;t load the fixtures &amp; signs catalog: {error}</p>

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryItems = items
          .filter((item) => item.category_id === category.id)
          .sort((a, b) => a.sku.localeCompare(b.sku))

        const visibleItems = categoryItems.filter((item) =>
          isFieldVisible(rules, values, item.metadata.field_key)
        )
        if (visibleItems.length === 0) return null

        return (
          <div key={category.id} className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {category.display_name}
            </p>
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
          </div>
        )
      })}
    </div>
  )
}
