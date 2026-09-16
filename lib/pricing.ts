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

/**
 * `conveyorPrice` is the real `parts.unit_price` of the generated belt conveyor part number
 * (see lib/conveyor/beltPartNumber.ts), or 0 when nothing is generated / nothing priced. It
 * needs a DB lookup, so callers resolve it (useConveyorPart on the client, conveyorPartPrice in
 * the save action) and pass it in rather than this function deriving it.
 */
export function computeQuoteTotal(
  lineItems: LineItem[],
  selections: Record<string, SelectionValue>,
  discountPercent: number | null | undefined,
  conveyorPrice = 0
): number {
  const lineItemsSubtotal = lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const subtotal = lineItemsSubtotal + selectionsPartsTotal(selections) + conveyorPrice
  const pct = discountPercent ?? 0
  return Math.max(0, subtotal * (1 - pct / 100))
}
