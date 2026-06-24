'use client'

import { useSelectionsStore } from '@/store/selectionsStore'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { generalFields } from '@/lib/configurator/generalFields'
import { isFieldVisible } from '@/lib/rules/engine'

interface SummaryRow {
  key: string
  label: string
  value: string
}

/**
 * Live readout of every field with a value, across all tabs — General fields are always
 * visible; Equipment fields are filtered through the same dependency-rules engine the tab
 * itself uses, so a value left over in a now-hidden field (e.g. CTA Type after CTA is
 * switched back to No) doesn't show here either. Pricing isn't on the catalog yet — Total
 * stays $0.00 until that data arrives.
 */
export default function SummaryPanel() {
  const values = useSelectionsStore((s) => s.values)
  const { items, options, rules } = useEquipmentCatalog('equipment')

  const rows: SummaryRow[] = []

  for (const field of generalFields) {
    const raw = values[field.key]
    if (raw === null || raw === undefined || raw === '') continue
    const label =
      field.widget === 'text' ? String(raw) : field.options?.find((o) => o.value === raw)?.label ?? String(raw)
    rows.push({ key: field.key, label: field.label, value: label })
  }

  for (const item of items) {
    const { field_key, widget, unit } = item.metadata
    const raw = values[field_key]
    if (raw === null || raw === undefined || raw === '') continue
    if (!isFieldVisible(rules, values, field_key)) continue

    const value =
      widget === 'number'
        ? raw === 'none'
          ? 'None'
          : `${raw}${unit ?? ''}`
        : options.find((o) => o.item_id === item.id && o.option_value === raw)?.option_label ?? String(raw)

    rows.push({ key: field_key, label: item.name, value })
  }

  return (
    <aside className="sticky top-0 flex h-screen w-96 shrink-0 self-start flex-col border-l border-slate-200 bg-ink text-white">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-300">Quote Summary</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400">
            No items selected yet. Choices you make across each tab will appear here.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rows.map((row) => (
              <li key={row.key} className="flex justify-between gap-3">
                <span className="text-slate-300">{row.label}</span>
                <span className="text-right font-medium">{row.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
        <span className="font-mono text-lg font-semibold">$0.00</span>
      </div>
    </aside>
  )
}
