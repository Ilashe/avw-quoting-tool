'use client'

import { useSelectionsStore } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { generalFields } from '@/lib/configurator/generalFields'
import { isFieldVisible } from '@/lib/rules/engine'
import { computeQuoteTotal } from '@/lib/pricing'
import { formatCurrency } from '@/lib/format'

interface SummaryRow {
  key: string
  label: string
  value: string
}

export default function SummaryPanel() {
  const values = useSelectionsStore((s) => s.values)
  const lineItems = useLineItemsStore((s) => s.items)
  const total = computeQuoteTotal(lineItems, values['items_discount_percent'] as number | null)
  // null = all tabs; single fetch covers equipment, backroom, fixtures_signs, etc.
  const { items, options, rules } = useEquipmentCatalog(null)

  const rows: SummaryRow[] = []

  for (const field of generalFields) {
    const raw = values[field.key]
    if (raw === null || raw === undefined || raw === '') continue
    // text and address_autocomplete: show raw string; radio/select: look up label
    const displayValue =
      field.widget === 'text' || field.widget === 'address_autocomplete'
        ? String(raw)
        : field.options?.find((o) => o.value === raw)?.label ?? String(raw)
    rows.push({ key: field.key, label: field.label, value: displayValue })
  }

  for (const item of items) {
    const { field_key, widget, unit } = item.metadata
    const raw = values[field_key]
    if (raw === null || raw === undefined || raw === '') continue
    if (widget === 'pending') continue
    if (!isFieldVisible(rules, values, field_key)) continue

    let displayValue: string
    if (widget === 'number' || widget === 'combobox_range') {
      displayValue = raw === 'none' ? 'None' : `${raw}${unit ? ' ' + unit : ''}`
    } else if (widget === 'select_range') {
      displayValue = `${raw}${unit ? ' ' + unit : ''}`
    } else {
      displayValue =
        options.find((o) => o.item_id === item.id && o.option_value === raw)?.option_label ?? String(raw)
    }

    rows.push({ key: field_key, label: item.name, value: displayValue })
  }

  return (
    <aside className="sticky top-0 flex h-screen w-96 shrink-0 self-start flex-col border-l border-slate-200 bg-ink text-white">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-300">Quote Summary</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {rows.length === 0 && lineItems.length === 0 ? (
          <p className="text-sm text-slate-400">
            No items selected yet. Choices you make across each tab will appear here.
          </p>
        ) : (
          <>
            {rows.length > 0 && (
              <ul className="space-y-2 text-sm">
                {rows.map((row) => (
                  <li key={row.key} className="flex justify-between gap-3">
                    <span className="text-slate-300">{row.label}</span>
                    <span className="text-right font-medium">{row.value}</span>
                  </li>
                ))}
              </ul>
            )}

            {lineItems.length > 0 && (
              <div className={rows.length > 0 ? 'mt-4 border-t border-white/10 pt-3' : ''}>
                <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-300">Line Items</p>
                <ul className="space-y-2 text-sm">
                  {lineItems.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="text-slate-300">
                        {item.quantity}× {item.description}
                      </span>
                      <span className="text-right font-medium">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
        <span className="font-mono text-lg font-semibold">{formatCurrency(total)}</span>
      </div>
    </aside>
  )
}
