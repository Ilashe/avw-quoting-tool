import { NextResponse } from 'next/server'
import { saveQuote } from '@/lib/actions/quotes'
import type { SelectionValue } from '@/store/selectionsStore'
import type { LineItem } from '@/types/parts'

/**
 * Background save endpoint for the configurator (autosave, the unmount flush, and the hand-off to
 * the Review page). It exists because these saves used to be server actions, and Next's router
 * serializes server actions with navigation — an action in flight (or issued right after a
 * push) could delay or even override the navigation, which is what made Next → Review feel
 * slow and sometimes never leave the configurator. A plain fetch to a route handler runs
 * alongside navigation instead. Authentication and the write itself are unchanged: this just
 * calls the same saveQuote used before.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await request.json()) as {
    selections: Record<string, SelectionValue>
    lineItems: LineItem[]
  }
  await saveQuote(id, body.selections ?? {}, body.lineItems ?? [])
  return NextResponse.json({ ok: true })
}
