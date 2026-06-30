'use client'

import { TAB_LABELS, TAB_ORDER, useConfiguratorStore } from '@/store/configuratorStore'

interface FooterNavProps {
  onFinish: () => void
  isComplete: boolean
  finishing?: boolean
}

export default function FooterNav({ onFinish, isComplete, finishing = false }: FooterNavProps) {
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
          onClick={onFinish}
          disabled={finishing}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${
            isComplete
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-brand hover:bg-ink'
          }`}
        >
          {finishing ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Finishing…
            </>
          ) : isComplete ? (
            <>✓ Finished</>
          ) : (
            <>Finish →</>
          )}
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
