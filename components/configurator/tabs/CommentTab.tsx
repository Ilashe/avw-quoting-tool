'use client'

import { useSelectionsStore } from '@/store/selectionsStore'
import { QUOTE_COMMENT_DRAFT_FIELD } from '@/lib/configurator/commentFields'

/**
 * `onNext` is the shell's handleReview: it publishes this note to the quote (draft -> committed
 * comment), saves, and opens the standalone Review page.
 */
export default function CommentTab({ onNext }: { onNext: () => void }) {
  const setField = useSelectionsStore((s) => s.setField)
  const draft = useSelectionsStore((s) => s.values[QUOTE_COMMENT_DRAFT_FIELD])
  const draftText = typeof draft === 'string' ? draft : ''

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <label htmlFor="quote-comment" className="block text-sm font-medium text-ink">
          Comment
        </label>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Appears on the Review page and the generated quote.
        </p>
        <textarea
          id="quote-comment"
          value={draftText}
          onChange={(e) => setField(QUOTE_COMMENT_DRAFT_FIELD, e.target.value)}
          rows={10}
          placeholder="Type any notes, exclusions or special terms for this quote…"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Next → Review
      </button>
    </div>
  )
}
