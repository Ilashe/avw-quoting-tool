'use client'

export default function SummaryPanel() {
  // Phase 3 wires this list to selected equipment + the pricing engine.
  const lineItems: { name: string; price: number }[] = []

  return (
    <aside className="flex w-72 flex-col border-l border-slate-200 bg-ink text-white">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-300">Quote Summary</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {lineItems.length === 0 ? (
          <p className="text-sm text-slate-400">
            No items selected yet. Choices you make across each tab will appear here.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {lineItems.map((item) => (
              <li key={item.name} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-mono">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
        <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
        <span className="font-mono text-lg font-semibold">$0.00</span>
      </div>
    </aside>
  )
}
