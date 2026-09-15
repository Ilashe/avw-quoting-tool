'use client'

import { Fragment } from 'react'
import { useSelectionsStore } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { generalFields } from '@/lib/configurator/generalFields'
import { isFieldVisible } from '@/lib/rules/engine'
import { computeQuoteTotal } from '@/lib/pricing'
import { formatCurrency } from '@/lib/format'
import { usePartsByNumbers } from '@/lib/catalog/usePartsByNumbers'
import {
  buildConveyorPartNumber,
  buildConveyorDescription,
  CONVEYOR_PART_NUMBER_FIELD_KEYS,
} from '@/lib/conveyor/beltPartNumber'
import type { SelectedPart } from '@/types/parts'

const CONVEYOR_PART_NUMBER_FIELDS = new Set<string>(CONVEYOR_PART_NUMBER_FIELD_KEYS)

interface HeaderRow {
  key: string
  label: string
  value: string
}

interface ItemRow {
  key: string
  item: string
  description: string
  quantity: number | null
  unitPrice: number | null
  price: number
}

export default function SummaryPanel() {
  const values = useSelectionsStore((s) => s.values)
  const lineItems = useLineItemsStore((s) => s.items)
  const discountPercent = values['items_discount_percent'] as number | null
  const total = computeQuoteTotal(lineItems, values, discountPercent)
  // null = all tabs; single fetch covers equipment, backroom, fixtures_signs, etc.
  const { items, options, rules } = useEquipmentCatalog(null)

  // General tab fields (Customer, Ship to Address, drive type, voltages, liftgate) are
  // quote-header attributes, not priced items — shown as a header block, not the item table.
  const headerRows: HeaderRow[] = []
  let customerName = ''

  for (const field of generalFields) {
    const raw = values[field.key]
    if (raw === null || raw === undefined || raw === '') continue
    if (typeof raw === 'string' && raw.toLowerCase() === 'no') continue
    const displayValue =
      field.widget === 'text' || field.widget === 'address_autocomplete'
        ? String(raw)
        : (field.options?.find((o) => o.value === raw)?.label ?? String(raw))
    if (field.key === 'customer') {
      customerName = displayValue
      continue
    }
    headerRows.push({ key: field.key, label: field.label, value: displayValue })
  }

  // Trigger fields (e.g. "Sidewashers" Yes/No) that gate a multi_part_picker are never shown
  // as their own row — Yes/No is just a gate, not a priced selection. Whether the answer is
  // Yes or No, and whether the picker has any selections yet, the summary stays silent for
  // this field; only the actual picked parts ever appear (added below when the picker field
  // itself is processed).
  const suppressedTriggerFields = new Set<string>()
  for (const rule of rules) {
    if (rule.action_type !== 'show') continue
    const targetItem = items.find((i) => i.metadata.field_key === rule.target_field)
    if (targetItem?.metadata.widget !== 'multi_part_picker') continue
    suppressedTriggerFields.add(rule.trigger_field)
  }

  const itemRows: ItemRow[] = []

  for (const item of items) {
    const { field_key, widget, unit } = item.metadata
    const raw = values[field_key]
    if (raw === null || raw === undefined || raw === '') continue
    if (typeof raw === 'string' && raw.toLowerCase() === 'no') continue
    if (widget === 'pending') continue
    if (!isFieldVisible(rules, values, field_key)) continue
    if (suppressedTriggerFields.has(field_key)) continue
    // Series/Drive/Config/Horsepower/Length/Type-of-Steel never show as their own rows — they
    // only ever appear combined into the single generated "Belt Part Number" row below.
    if (CONVEYOR_PART_NUMBER_FIELDS.has(field_key)) continue

    // Robot Arch (and any future multi_part_picker field): show each picked part's own
    // detail row instead of a generic "Yes". The same part can be selectable under more
    // than one picker (e.g. also under Applicator Arches), so the Item column shows the
    // trigger field's name (e.g. "Robot Arch") rather than the bare part number, to make
    // clear which selection each row came from; the part number/description move into
    // the Description column.
    if (widget === 'multi_part_picker') {
      const rule = rules.find((r) => r.action_type === 'show' && r.target_field === field_key)
      const triggerItem = rule ? items.find((i) => i.metadata.field_key === rule.trigger_field) : null
      const groupLabel = triggerItem?.name ?? item.name
      // Index in the key (not just part_number) because two different trigger parts in the
      // same picker can bundle the same required part (e.g. CB0405 and CB0405-EL both pull in
      // CB0405AMC-23-13 as a core item) — those are legitimately separate rows, one set of
      // cores per unit, not a single merged quantity.
      ;(raw as SelectedPart[]).forEach((part, i) => {
        const quantity = part.quantity ?? 1
        itemRows.push({
          key: `${field_key}:${i}:${part.part_number}`,
          item: part.choice_label ? `${groupLabel} — ${part.choice_label}` : groupLabel,
          description: `${part.part_number} — ${part.description}`,
          quantity,
          unitPrice: part.unit_price,
          price: part.unit_price * quantity,
        })
      })
      continue
    }

    let description: string
    if (widget === 'number' || widget === 'combobox_range') {
      description = raw === 'none' ? 'None' : `${raw}${unit ? ' ' + unit : ''}`
    } else if (widget === 'select_range') {
      description = `${raw}${unit ? ' ' + unit : ''}`
    } else {
      description =
        options.find((o) => o.item_id === item.id && o.option_value === raw)?.option_label ?? String(raw)
    }

    itemRows.push({ key: field_key, item: item.name, description, quantity: null, unitPrice: null, price: 0 })
  }

  const conveyorInputs = {
    series: (values['conveyor_series'] as string) ?? null,
    drive: (values['conveyor_drive'] as string) ?? null,
    horsepower: (values['conveyor_horsepower'] as string) ?? null,
    lengthFt: (values['conveyor_length'] as number | string) ?? null,
    steelType: (values['conveyor_steel_type'] as string) ?? null,
    beltType: (values['conveyor_belt_type'] as string) ?? null,
  }
  const conveyorPartNumber = buildConveyorPartNumber(conveyorInputs)
  // Real pricing/description from the client's Items export (imported into `parts`) always wins
  // when the exact generated part number has been priced; buildConveyorDescription's formula is
  // only a fallback for combinations with no real match yet (price stays $0 in that case, same
  // "no data = no guessed price" convention used everywhere else in this app).
  const { parts: conveyorPartLookup } = usePartsByNumbers(conveyorPartNumber ? [conveyorPartNumber] : [])
  if (conveyorPartNumber) {
    const realPart = conveyorPartLookup.find((p) => p.part_number === conveyorPartNumber)
    const description =
      realPart?.description ??
      buildConveyorDescription({ ...conveyorInputs, colorId: (values['belt_color'] as string) ?? null }) ??
      ''
    itemRows.push({
      key: 'conveyor_part_number',
      item: conveyorPartNumber,
      description,
      quantity: 1,
      unitPrice: realPart?.unit_price ?? 0,
      price: realPart?.unit_price ?? 0,
    })
  }

  for (const line of lineItems) {
    itemRows.push({
      key: line.id,
      item: line.part_number ?? 'Custom',
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      price: line.unit_price * line.quantity,
    })
  }

  const hasContent = Boolean(customerName) || headerRows.length > 0 || itemRows.length > 0

  return (
    <aside className="sticky top-0 flex h-screen w-[34rem] shrink-0 self-start flex-col border-l border-slate-200 bg-ink text-white">
      <div className="border-b border-white/10 px-5 py-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-300">Quote Summary</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!hasContent ? (
          <p className="text-sm text-slate-400">
            No items selected yet. Choices you make across each tab will appear here.
          </p>
        ) : (
          <>
            {/* Header block: quote-level attributes, not priced items */}
            <div className="mb-4 border-b border-white/10 pb-4">
              <p className="font-display text-lg uppercase tracking-wide text-white">
                {customerName || 'Untitled Quote'}
              </p>
              {headerRows.length > 0 && (
                <div className="mt-2 space-y-1 text-xs">
                  {headerRows.map((row) => (
                    <div key={row.key} className="flex justify-between gap-3">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-medium text-slate-200">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item table: Item | Description | Qty | Unit Price | Price */}
            {itemRows.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-3 gap-y-2 text-sm">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Item</span>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Description</span>
                <span className="text-right text-[11px] uppercase tracking-wide text-slate-400">Qty</span>
                <span className="text-right text-[11px] uppercase tracking-wide text-slate-400">Unit Price</span>
                <span className="text-right text-[11px] uppercase tracking-wide text-slate-400">Price</span>
                {itemRows.map((row) => (
                  <Fragment key={row.key}>
                    <span className="min-w-0 truncate font-medium text-slate-100">{row.item}</span>
                    <span className="line-clamp-2 min-w-0 text-xs text-slate-300" title={row.description}>
                      {row.description}
                    </span>
                    <span className="text-right text-xs text-slate-300">{row.quantity ?? ''}</span>
                    <span className="text-right text-xs text-slate-300">
                      {row.unitPrice !== null ? formatCurrency(row.unitPrice) : ''}
                    </span>
                    <span className="text-right font-medium text-slate-100">{formatCurrency(row.price)}</span>
                  </Fragment>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
        <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
        <span className="font-mono text-lg font-semibold">{formatCurrency(total)}</span>
      </div>
    </aside>
  )
}
