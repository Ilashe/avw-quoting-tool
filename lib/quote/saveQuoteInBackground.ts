import type { SelectionValue } from '@/store/selectionsStore'
import type { LineItem } from '@/types/parts'

/**
 * Client-side save that does not go through a server action — see app/api/quotes/[id]/save.
 * Use this for anything that can overlap a navigation (autosave, unmount flush, Review hand-off).
 */
export async function saveQuoteInBackground(
  quoteId: string,
  selections: Record<string, SelectionValue>,
  lineItems: LineItem[]
): Promise<void> {
  const response = await fetch(`/api/quotes/${quoteId}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selections, lineItems }),
  })
  if (!response.ok) throw new Error(`Save failed (${response.status})`)
}
