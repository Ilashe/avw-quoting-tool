'use client'

import { memo, useMemo } from 'react'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useSelectionsStore } from '@/store/selectionsStore'
import { isFieldVisible, getExcludedOptionValues } from '@/lib/rules/engine'
import SectionAccordion from '../SectionAccordion'
import RadioGroup from '../fields/RadioGroup'
import SelectField from '../fields/SelectField'
import NumberField from '../fields/NumberField'
import type { EquipmentItem, EquipmentOption } from '@/types/equipment'

const EMPTY_OPTIONS: EquipmentOption[] = []

function rangeOptions(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, i) => {
    const n = min + i
    return { value: String(n), label: String(n) }
  })
}

/**
 * Memoized so a click on one field doesn't re-render (and re-mutate the DOM of) the other
 * 26 — each instance subscribes only to its own value in the store, and `visible`/
 * `excludedOptionsKey` are plain primitives computed once by the parent, so React.memo's
 * shallow comparison actually skips unaffected fields. Without this, every keystroke/click
 * caused 200+ DOM mutations across the whole tab, which was also confirmed to trigger
 * spurious browser scroll jumps (see PROJECT_STATUS.md, 2026-06-24 notes).
 */
const EquipmentField = memo(function EquipmentField({
  item,
  options,
  visible,
  excludedOptionsKey,
}: {
  item: EquipmentItem
  options: EquipmentOption[]
  visible: boolean
  excludedOptionsKey: string
}) {
  const { field_key, widget, required, min, max, unit, allow_none, helper_text } = item.metadata
  const value = useSelectionsStore((s) => s.values[field_key] ?? null)
  const setField = useSelectionsStore((s) => s.setField)

  if (!visible) return null

  if (widget === 'number') {
    return (
      <NumberField
        label={item.name}
        value={value as string | number | null}
        onChange={(v) => setField(field_key, v)}
        min={min}
        max={max}
        unit={unit}
        allowNone={allow_none}
        helperText={helper_text}
      />
    )
  }

  const excluded = new Set(excludedOptionsKey ? excludedOptionsKey.split(',') : [])
  const fieldOptions =
    widget === 'select_range' && min !== undefined && max !== undefined
      ? rangeOptions(min, max)
      : options
          .filter((o) => !excluded.has(o.option_value))
          .map((o) => ({ value: o.option_value, label: o.option_label }))

  if (widget === 'select' || widget === 'select_range') {
    return (
      <SelectField
        label={item.name}
        required={required}
        options={fieldOptions}
        value={value as string | null}
        onChange={(v) => setField(field_key, v)}
      />
    )
  }

  return (
    <RadioGroup
      name={field_key}
      label={item.name}
      required={required}
      options={fieldOptions}
      value={value as string | null}
      onChange={(v) => setField(field_key, v)}
    />
  )
})

export default function EquipmentTab() {
  const { categories, items, options, rules, loading, error } = useEquipmentCatalog('equipment')
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

  if (loading) {
    return <p className="text-sm text-slate-500">Loading equipment catalog…</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">Couldn&apos;t load the equipment catalog: {error}</p>
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryItems = items
          .filter((item) => item.category_id === category.id)
          .sort((a, b) => a.sku.localeCompare(b.sku))

        return (
          <SectionAccordion key={category.id} title={category.display_name}>
            {categoryItems.map((item) => {
              const fieldKey = item.metadata.field_key
              const visible = isFieldVisible(rules, values, fieldKey)
              const excludedOptionsKey = Array.from(getExcludedOptionValues(rules, values, fieldKey))
                .sort()
                .join(',')

              return (
                <EquipmentField
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

      <SectionAccordion title="Friction" defaultOpen={false}>
        <p className="text-sm text-slate-500">
          This section hasn&apos;t been defined yet — fields will be added once the client
          provides the friction specs.
        </p>
      </SectionAccordion>
    </div>
  )
}
