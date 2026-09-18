'use client'

import { FileDown } from 'lucide-react'
import { TAB_LABELS, useConfiguratorStore, type TabKey } from '@/store/configuratorStore'

interface FooterNavProps {
  /** Tabs actually in the flow right now — Vacuum drops out unless it's being purchased. */
  order: TabKey[]
  onGenerate: () => void
  isComplete: boolean
  generating?: boolean
}

export default function FooterNav({ order, onGenerate, isComplete, generating = false }: FooterNavProps) {
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const goBack = useConfiguratorStore((s) => s.goBack)
  const goNext = useConfiguratorStore((s) => s.goNext)

  const index = order.indexOf(activeTab)
  const isFirst = index === 0
  // Review is the last tab: its forward button generates the PDF instead of advancing.
  const isLast = index === order.length - 1
  const nextLabel = isLast ? null : TAB_LABELS[order[index + 1]]

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
      <button
        type="button"
        onClick={() => goBack(order)}
        disabled={isFirst}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist disabled:opacity-40"
      >
        ← Back
      </button>

      {isLast ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
            isComplete ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand hover:bg-ink'
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
              Generate Quote
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => goNext(order)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Next → {nextLabel}
        </button>
      )}
    </div>
  )
}
