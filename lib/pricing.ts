import type { LineItem, SelectedPart } from '@/types/parts'
import type { SelectionValue } from '@/store/selectionsStore'

function isSelectedPartArray(value: SelectionValue): value is SelectedPart[] {
  return Array.isArray(value)
}

/** Sums prices of parts picked via any multi_part_picker field (e.g. Robot Arch). */
export function selectionsPartsTotal(selections: Record<string, SelectionValue>): number {
  let total = 0
  for (const value of Object.values(selections)) {
    if (isSelectedPartArray(value)) {
      total += value.reduce((sum, part) => sum + part.unit_price * (part.quantity ?? 1), 0)
    }
  }
  return total
}

export function computeQuoteTotal(
  lineItems: LineItem[],
  selections: Record<string, SelectionValue>,
  discountPercent: number | null | undefined
): number {
  const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const subtotal = lineItemsSubtotal + selectionsPartsTotal(selections)
  const pct = discountPercent ?? 0
  return Math.max(0, subtotal * (1 - pct / 100))
}
