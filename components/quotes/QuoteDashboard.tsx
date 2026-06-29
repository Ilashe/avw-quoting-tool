'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteQuote, type QuoteSummary } from '@/lib/actions/quotes'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function QuoteDashboard({ initialQuotes }: { initialQuotes: QuoteSummary[] }) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    const label = name || 'this untitled quote'
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
    setDeleting(id)
    await deleteQuote(id)
    setQuotes((prev) => prev.filter((q) => q.id !== id))
    setDeleting(null)
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide text-ink">Quotes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {quotes.length === 0
              ? 'No quotes yet. Start a new one.'
              : `${quotes.length} quote${quotes.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link
          href="/quotes/new"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink"
        >
          + New Quote
        </Link>
      </div>

      {/* Empty state */}
      {quotes.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-sm font-medium text-slate-400">No quotes yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Click <span className="font-semibold">+ New Quote</span> to get started
          </p>
        </div>
      )}

      {/* Quote list */}
      {quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-brand/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mist text-ink">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                {/* Info */}
                <div>
                  <p className="font-semibold text-ink">
                    {q.customer_name || <span className="italic text-slate-400">Untitled Quote</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Last edited {formatDate(q.updated_at)} at {formatTime(q.updated_at)}
                    <span className="mx-1.5">·</span>
                    Created {formatDate(q.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status badge */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    q.status === 'complete'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {q.status}
                </span>
                {/* Actions */}
                <Link
                  href={`/quotes/${q.id}`}
                  className="rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white"
                >
                  Open
                </Link>
                <button
                  type="button"
                  disabled={deleting === q.id}
                  onClick={() => handleDelete(q.id, q.customer_name)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  {deleting === q.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
