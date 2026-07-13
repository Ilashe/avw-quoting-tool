'use client'

import Link from 'next/link'
import { useSelectionsStore } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { computeQuoteTotal } from '@/lib/pricing'
import { formatCurrency } from '@/lib/format'

export default function TopBar({
  saving,
  onNewQuote,
}: {
  saving: boolean
  onNewQuote: () => void
}) {
  const customerName = useSelectionsStore((s) => s.values['customer'] as string | null | undefined)
  const discountPercent = useSelectionsStore((s) => s.values['items_discount_percent'] as number | null)
  const lineItems = useLineItemsStore((s) => s.items)
  const total = computeQuoteTotal(lineItems, discountPercent)

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="font-display text-xl uppercase tracking-wide text-ink">
          {customerName || 'New Quote'}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          {saving ? (
            <>
              <span className="inline-block size-1.5 rounded-full bg-amber-400" />
              Saving…
            </>
          ) : (
            <>
              <span className="inline-block size-1.5 rounded-full bg-green-400" />
              Saved
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
          <p className="font-mono font-semibold text-ink">{formatCurrency(total)}</p>
        </div>
        <Link
          href="/quotes"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-mist"
        >
          ← Quotes
        </Link>
        <button
          type="button"
          onClick={onNewQuote}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
        >
          New Quote
        </button>
      </div>
    </div>
  )
}
