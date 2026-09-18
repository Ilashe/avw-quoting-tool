import type { SelectionValue } from '@/store/selectionsStore'
import type { EquipmentItem, EquipmentOption, DependencyRule } from '@/types/equipment'
import type { SelectedPart } from '@/types/parts'
import { isFieldVisible } from '@/lib/rules/engine'

/**
 * Where the Layout tab's arrangement lives on the quote. Stored as a '|'-delimited string of
 * field_keys rather than a real array on purpose: selectionsPartsTotal (lib/pricing.ts) treats
 * EVERY array in `selections` as SelectedPart[] and sums part.unit_price off it, so an array of
 * strings here would poison the quote total with NaN. A string is inert to every existing
 * consumer, and it rides along in the same `selections` jsonb the autosave already persists.
 */
export const TUNNEL_LAYOUT_ORDER_FIELD = 'tunnel_layout_order'

const SEPARATOR = '|'

export interface LayoutPiece {
  fieldKey: string
  /** Equipment item name, e.g. "Wheel Blaster". */
  name: string
  /** The selected value as shown to the user, e.g. "Spinning Wheel Blaster". */
  detail: string
}

export function decodeLayoutOrder(value: SelectionValue): string[] {
  return typeof value === 'string' && value ? value.split(SEPARATOR).filter(Boolean) : []
}

export function encodeLayoutOrder(fieldKeys: string[]): string {
  return fieldKeys.join(SEPARATOR)
}

/**
 * Every Equipment-tab selection the user has actually made, as draggable tunnel positions.
 * Client instruction (2026-09-18): literally every field with a value counts, spec fields
 * (Belt Color, Voltage, Type of Steel…) included — not just the machines.
 *
 * Skips the same things the Quote Summary skips: blanks, "No" answers, `pending` placeholder
 * fields and anything a dependency rule currently hides.
 */
export function buildLayoutPieces({
  values,
  items,
  options,
  rules,
}: {
  values: Record<string, SelectionValue>
  items: EquipmentItem[]
  options: EquipmentOption[]
  rules: DependencyRule[]
}): LayoutPiece[] {
  const pieces: LayoutPiece[] = []

  for (const item of items) {
    const { field_key, widget, unit } = item.metadata
    const raw = values[field_key]
    if (raw === null || raw === undefined || raw === '') continue
    if (typeof raw === 'string' && raw.toLowerCase() === 'no') continue
    if (widget === 'pending') continue
    if (!isFieldVisible(rules, values, field_key)) continue

    let detail: string
    if (widget === 'multi_part_picker') {
      const parts = raw as SelectedPart[]
      if (parts.length === 0) continue
      detail = parts.map((p) => p.part_number).join(', ')
    } else if (widget === 'number' || widget === 'combobox_range') {
      detail = raw === 'none' ? 'None' : `${raw}${unit ? ' ' + unit : ''}`
    } else if (widget === 'select_range') {
      detail = `${raw}${unit ? ' ' + unit : ''}`
    } else {
      detail =
        options.find((o) => o.item_id === item.id && o.option_value === raw)?.option_label ?? String(raw)
    }

    pieces.push({ fieldKey: field_key, name: item.name, detail })
  }

  return pieces
}

/**
 * Applies a saved arrangement to the current pieces. Anything newly selected since the order was
 * saved lands at the end (in catalog order) rather than disappearing, and keys in the saved order
 * whose field is no longer selected are simply ignored.
 */
export function applyLayoutOrder(pieces: LayoutPiece[], savedOrder: string[]): LayoutPiece[] {
  const byKey = new Map(pieces.map((p) => [p.fieldKey, p]))
  const ordered: LayoutPiece[] = []
  for (const key of savedOrder) {
    const piece = byKey.get(key)
    if (piece) {
      ordered.push(piece)
      byKey.delete(key)
    }
  }
  return [...ordered, ...pieces.filter((p) => byKey.has(p.fieldKey))]
}
