'use client'

import { useSelectionsStore } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useConveyorPart } from '@/lib/conveyor/useConveyorPart'
import { buildQuoteDocument, type QuoteDocument } from './buildQuoteDocument'

/**
 * The current quote as rows + totals. SummaryPanel, the Review page and the PDF export all read
 * this one hook, so what the user reviews is exactly what gets printed.
 */
export function useQuoteDocument(): QuoteDocument {
  const values = useSelectionsStore((s) => s.values)
  const lineItems = useLineItemsStore((s) => s.items)
  // null = all tabs; single fetch covers equipment, backroom, fixtures_signs, etc.
  const { items, options, rules } = useEquipmentCatalog(null)
  const { partNumber, realPart, price } = useConveyorPart(values)

  return buildQuoteDocument({
    values,
    lineItems,
    items,
    options,
    rules,
    conveyorPartNumber: partNumber,
    conveyorRealPart: realPart,
    conveyorPrice: price,
  })
}
