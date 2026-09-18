'use client'

import { formatCurrency } from '@/lib/format'
import { useQuoteDocument } from '@/lib/quote/useQuoteDocument'
import { SALES_TAX_RATE } from '@/lib/quote/buildQuoteDocument'
import { useSelectionsStore } from '@/store/selectionsStore'
import { readVacuumStats } from '@/lib/vacuum/vacuumQuote'

/**
 * Last step before the PDF: everything the quote contains, laid out full-width and unabbreviated
 * — the Quote Summary rail truncates item names and clamps descriptions to two lines, which is
 * fine while configuring but not for a final read-through.
 */
export default function ReviewTab() {
  const { customerName, headerRows, itemRows, comment, discountPercent, subtotal, salesTax, total } =
    useQuoteDocument()
  const values = useSelectionsStore((s) => s.values)
  const vacuumStats = readVacuumStats(values)

  const pricedRows = itemRows.filter((r) => r.price > 0)
  const configRows = itemRows.filter((r) => r.price === 0)

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <header>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">Review</p>
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink">
          {customerName || 'Untitled Quote'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Check everything below, then use Generate Quote to produce the PDF.
        </p>
      </header>

      {/* Quote-level attributes */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Quote Details</h2>
        {headerRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Nothing filled in on the General tab yet.</p>
        ) : (
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {headerRows.map((row) => (
              <div key={row.key}>
                <dt className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</dt>
                <dd className="mt-0.5 text-sm text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Vacuum system stats, when a vacuum quote has been generated */}
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

      {/* Configuration-only selections: no price of their own, but they define the build */}
      {configRows.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Configuration</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {configRows.map((row) => (
              <div key={row.key}>
                <dt className="text-[11px] uppercase tracking-wide text-slate-400">{row.item}</dt>
                <dd className="mt-0.5 text-sm text-ink">{row.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Priced line items */}
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

      {/* Totals */}
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
  )
}
