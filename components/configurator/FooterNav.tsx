'use client'

import { TAB_LABELS, TAB_ORDER, useConfiguratorStore } from '@/store/configuratorStore'

export default function FooterNav() {
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const goBack = useConfiguratorStore((s) => s.goBack)
  const goNext = useConfiguratorStore((s) => s.goNext)

  const index = TAB_ORDER.indexOf(activeTab)
  const isFirst = index === 0
  const isLast = index === TAB_ORDER.length - 1
  const nextLabel = isLast ? null : TAB_LABELS[TAB_ORDER[index + 1]]

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
      <button
        type="button"
        onClick={goBack}
        disabled={isFirst}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist disabled:opacity-40"
      >
        ← Back
      </button>
      {isLast ? (
        <button
          type="button"
          disabled
          title="Quote saving is built in Phase 9"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white opacity-50"
        >
          Save Quote
        </button>
      ) : (
        <button
          type="button"
          onClick={goNext}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Next → {nextLabel}
        </button>
      )}
    </div>
  )
}
