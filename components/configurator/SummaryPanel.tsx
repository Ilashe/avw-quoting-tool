'use client'

import { Fragment, useState } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useQuoteDocument } from '@/lib/quote/useQuoteDocument'

export default function SummaryPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const { customerName, headerRows, itemRows, comment, subtotal } = useQuoteDocument()

  const hasContent = Boolean(customerName) || headerRows.length > 0 || itemRows.length > 0 || Boolean(comment)

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 self-start flex-col border-l border-slate-200 bg-ink text-white transition-[width] ${
        collapsed ? 'w-12' : 'w-[34rem]'
      }`}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Show quote summary"
          aria-label="Show quote summary"
          aria-expanded={false}
          className="flex flex-1 flex-col items-center gap-3 py-3 text-slate-300 transition hover:text-white"
        >
          <PanelRightOpen className="size-5 shrink-0" />
          <span className="text-[11px] uppercase tracking-wide [writing-mode:vertical-rl]">
            Quote Summary
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-300">Quote Summary</p>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Hide quote summary"
            aria-label="Hide quote summary"
            aria-expanded
            className="-mr-1 rounded p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <PanelRightClose className="size-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4" hidden={collapsed}>
        {!hasContent ? (
          <p className="text-sm text-slate-400">
            No items selected yet. Choices you make across each tab will appear here.
          </p>
        ) : (
          <>
            {/* Header block: quote-level attributes, not priced items */}
            <div className="mb-4 border-b border-white/10 pb-4">
              <p className="font-display text-lg uppercase tracking-wide text-white">
                {customerName || 'Untitled Quote'}
              </p>
              {headerRows.length > 0 && (
                <div className="mt-2 space-y-1 text-xs">
                  {headerRows.map((row) => (
                    <div key={row.key} className="flex justify-between gap-3">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-medium text-slate-200">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item table: Item | Description | Qty | Unit Price | Price */}
            {itemRows.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-3 gap-y-2 text-sm">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Item</span>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Description</span>
                <span className="text-right text-[11px] uppercase tracking-wide text-slate-400">Qty</span>
                <span className="text-right text-[11px] uppercase tracking-wide text-slate-400">Unit Price</span>
                <span className="text-right text-[11px] uppercase tracking-wide text-slate-400">Price</span>
                {itemRows.map((row) => (
                  <Fragment key={row.key}>
                    <span className="min-w-0 truncate font-medium text-slate-100">{row.item}</span>
                    <span className="line-clamp-2 min-w-0 text-xs text-slate-300" title={row.description}>
                      {row.description}
                    </span>
                    <span className="text-right text-xs text-slate-300">{row.quantity ?? ''}</span>
                    <span className="text-right text-xs text-slate-300">
                      {row.unitPrice !== null ? formatCurrency(row.unitPrice) : ''}
                    </span>
                    <span className="text-right font-medium text-slate-100">{formatCurrency(row.price)}</span>
                  </Fragment>
                ))}
              </div>
            )}

            {/* Comment committed from the Comment tab's Next button */}
            {comment && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Comment</p>
                <p className="mt-1.5 whitespace-pre-wrap text-xs text-slate-200">{comment}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3" hidden={collapsed}>
        <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
        <span className="font-mono text-lg font-semibold">{formatCurrency(subtotal)}</span>
      </div>
    </aside>
  )
}
