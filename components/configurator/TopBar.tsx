'use client'

export default function TopBar({
  quoteNumber,
  revisionLabel,
}: {
  quoteNumber: string
  revisionLabel: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="font-display text-xl uppercase tracking-wide text-ink">
          {quoteNumber}
          <span className="ml-2 text-sm text-slate-400">{revisionLabel}</span>
        </p>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Units</p>
          {/* Phase 3 wires this up to selection count */}
          <p className="font-semibold text-ink">0</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Total</p>
          {/* Phase 3 wires this up to the pricing engine */}
          <p className="font-mono font-semibold text-ink">$0.00</p>
        </div>
        <button
          type="button"
          disabled
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white opacity-50"
          title="Quote saving is built in Phase 9"
        >
          Save ▾
        </button>
      </div>
    </div>
  )
}
