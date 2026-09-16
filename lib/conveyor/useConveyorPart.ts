'use client'

import { usePartsByNumbers } from '@/lib/catalog/usePartsByNumbers'
import type { SelectionValue } from '@/store/selectionsStore'
import type { PartWithImage } from '@/types/parts'
import { buildConveyorPartNumber, conveyorInputsFromSelections } from './beltPartNumber'

/**
 * Generates the belt conveyor part number from the current selections and looks up its real
 * priced row in `parts` (null when nothing is generated yet or the combination isn't priced).
 * Shared by SummaryPanel (row) and TopBar (total) so both always agree.
 */
export function useConveyorPart(values: Record<string, SelectionValue>): {
  partNumber: string | null
  realPart: PartWithImage | null
  price: number
} {
  const partNumber = buildConveyorPartNumber(conveyorInputsFromSelections(values))
  const { parts } = usePartsByNumbers(partNumber ? [partNumber] : [])
  const realPart = partNumber ? (parts.find((p) => p.part_number === partNumber) ?? null) : null
  return { partNumber, realPart, price: realPart?.unit_price ?? 0 }
}
