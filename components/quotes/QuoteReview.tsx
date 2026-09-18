'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileDown } from 'lucide-react'
import { useSelectionsStore, type SelectionValue } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { finishQuote } from '@/lib/actions/quotes'
import { formatCurrency } from '@/lib/format'
import { useQuoteDocument } from '@/lib/quote/useQuoteDocument'
import { SALES_TAX_RATE } from '@/lib/quote/buildQuoteDocument'
import { generateQuotePdf } from '@/lib/pdf/quotePdf'
import { readVacuumStats } from '@/lib/vacuum/vacuumQuote'
import type { LineItem } from '@/types/parts'

/**
 * Standalone Review page (/quotes/[id]/review) — reached from the configurator's last Next, and
 * deliberately not a tab: no tab bar and no Quote Summary rail, just the whole quote laid out
 * full-width, unabbreviated (the rail truncates names and clamps descriptions to two lines).
 * Its forward button, Generate Quote, produces the PDF on AVW's quote form.
 */
export default function QuoteReview({
  quoteId,
  quoteNumber,
  initialSelections,
  initialLineItems,
}: {
  quoteId: string
  quoteNumber: string
  initialSelections: Record<string, SelectionValue>
  initialLineItems: LineItem[]
}) {
  const router = useRouter()
  const initSelections = useSelectionsStore((s) => s.init)
  const initLineItems = useLineItemsStore((s) => s.init)
  const values = useSelectionsStore((s) => s.values)
  const lineItems = useLineItemsStore((s) => s.items)

  // Hydrate from the database copy the configurator saved just before navigating here, so a
  // refresh or a direct link shows the same thing as arriving via Next.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    initSelections(initialSelections)
    initLineItems(initialLineItems)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId])

  const doc = useQuoteDocument()
  const vacuumStats = readVacuumStats(values)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      await generateQuotePdf(doc, { quoteNumber })
      await finishQuote(quoteId, values, lineItems)
      setGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the quote.')
    } finally {
      setGenerating(false)
    }
  }

  if (!ready) {
    return <div className="p-10 text-sm text-slate-400">Loading review…</div>
  }

  const { customerName, headerRows, itemRows, comment, discountPercent, subtotal, salesTax, total } = doc
  const pricedRows = itemRows.filter((r) => r.price > 0)
  const configRows = itemRows.filter((r) => r.price === 0)

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-8 py-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Review · Quote #{quoteNumber}
            </p>
            <h1 className="font-display text-4xl uppercase tracking-wide text-ink">
              {customerName || 'Untitled Quote'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Check everything below, then use Generate Quote to produce the PDF.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Total incl. tax</p>
            <p className="font-mono text-2xl font-semibold text-ink">{formatCurrency(total)}</p>
          </div>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Quote Details</h2>
          {headerRows.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nothing filled in on the General tab yet.</p>
          ) : (
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {headerRows.map((row) => (
                <div key={row.key}>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</dt>
                  <dd className="mt-0.5 text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {vacuumStats && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Vacuum System</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Rows', vacuumStats.rows],
                ['Total Arches', vacuumStats.totalArches],
                ['Total Drops', vacuumStats.totalDrops],
                ['Central Units', vacuumStats.centralUnits],
                ['Voltage', vacuumStats.voltage],
                ['Tools', vacuumStats.toolPreference],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg bg-mist/60 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {configRows.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Configuration</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {configRows.map((row) => (
                <div key={row.key}>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">{row.item}</dt>
                  <dd className="mt-0.5 text-sm text-ink">{row.description}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
            Items <span className="ml-1 font-normal text-slate-400">({pricedRows.length})</span>
          </h2>
          {pricedRows.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No priced items on this quote yet.</p>
          ) : (
            <table className="mt-4 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 text-left font-semibold">Item</th>
                  <th className="py-2 pr-4 text-left font-semibold">Description</th>
                  <th className="py-2 pr-4 text-right font-semibold">Qty</th>
                  <th className="py-2 pr-4 text-right font-semibold">Unit Price</th>
                  <th className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {pricedRows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4 font-mono text-xs font-medium text-ink">{row.item}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.description}</td>
                    <td className="py-3 pr-4 text-right text-slate-600">{row.quantity ?? ''}</td>
                    <td className="py-3 pr-4 text-right font-mono text-slate-600">
                      {row.unitPrice !== null ? formatCurrency(row.unitPrice) : ''}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-ink">
                      {formatCurrency(row.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {comment && (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Comment</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment}</p>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <dl className="ml-auto max-w-sm space-y-2 text-sm">
            {discountPercent ? (
              <div className="flex justify-between text-slate-500">
                <dt>Discount applied</dt>
                <dd className="font-mono">{discountPercent}%</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-mono font-medium text-ink">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Est. Sales Tax ({(SALES_TAX_RATE * 100).toFixed(1)}%)</dt>
              <dd className="font-mono font-medium text-ink">{formatCurrency(salesTax)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <dt className="font-display text-lg uppercase tracking-wide text-ink">Total</dt>
              <dd className="font-mono text-lg font-bold text-ink">{formatCurrency(total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-8 py-3">
          <button
            type="button"
            onClick={() => router.push(`/quotes/${quoteId}?tab=comment`)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            {error && <span className="text-xs text-red-600">{error}</span>}
            {generated && !error && (
              <>
                <span className="text-xs text-emerald-600">✓ Quote generated and saved</span>
                <Link href="/quotes" className="text-xs font-medium text-brand hover:underline">
                  All quotes
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
                generated ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand hover:bg-ink'
              }`}
            >
              {generating ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating…
                </>
              ) : (
                <>
                  <FileDown className="size-4" />
                  {generated ? 'Generate Again' : 'Generate Quote'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
