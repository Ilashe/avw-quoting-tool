'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  deleteQuote,
  cloneQuote,
  togglePin,
  getQuoteSelections,
  type QuoteSummary,
} from '@/lib/actions/quotes'
import type { SelectionValue } from '@/store/selectionsStore'

// ── helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(value: number) {
  if (value === 0) return '$0.00'
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function labelFromKey(key: string) {
  return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

type SortKey = 'newest' | 'oldest' | 'az' | 'za'
type TabKey  = 'all' | 'draft' | 'complete'

function sortQuotes(quotes: QuoteSummary[], sort: SortKey) {
  const list = [...quotes]
  switch (sort) {
    case 'newest': return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    case 'oldest': return list.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
    case 'az':     return list.sort((a, b) => a.customer_name.localeCompare(b.customer_name))
    case 'za':     return list.sort((a, b) => b.customer_name.localeCompare(a.customer_name))
  }
}

function groupByRecency(quotes: QuoteSummary[]): { label: string; items: QuoteSummary[] }[] {
  const now = new Date()
  const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 86_400_000
  const startOfWeek      = startOfToday - 6 * 86_400_000

  const buckets = [
    { label: 'Today',     items: [] as QuoteSummary[] },
    { label: 'Yesterday', items: [] as QuoteSummary[] },
    { label: 'This Week', items: [] as QuoteSummary[] },
    { label: 'Earlier',   items: [] as QuoteSummary[] },
  ]

  for (const q of quotes) {
    const t = new Date(q.updated_at).getTime()
    if (t >= startOfToday)          buckets[0].items.push(q)
    else if (t >= startOfYesterday) buckets[1].items.push(q)
    else if (t >= startOfWeek)      buckets[2].items.push(q)
    else                            buckets[3].items.push(q)
  }

  return buckets.filter((b) => b.items.length > 0)
}

// ── icons ─────────────────────────────────────────────────────────────────────

function DocIcon({ complete }: { complete: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {complete
        ? <polyline points="9 12 11 14 15 10" />
        : <><line x1="16" y1="13" x2="8" y2="13" /><line x1="12" y1="17" x2="8" y2="17" /></>}
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── greeting banner ───────────────────────────────────────────────────────────

function GreetingBanner({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    setGreeting(`${g}, ${name}`)
  }, [name])

  if (!greeting) return null

  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-ink to-slate-700 px-8 py-6 text-white shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
        AVW Quoting Tool
      </p>
      <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">{greeting}</h2>
      <p className="mt-1 text-sm text-white/60">
        Ready to build your next quote? Pick up where you left off or start fresh.
      </p>
    </div>
  )
}

// ── template cards ────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank Quote',
    description: 'Start from scratch',
    color: 'from-slate-100 to-slate-50',
    textColor: 'text-ink',
    available: true,
    href: '/quotes/new',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    id: 'full_tunnel',
    title: 'Full Tunnel',
    description: 'Complete tunnel setup',
    color: 'from-brand/10 to-sky/10',
    textColor: 'text-brand',
    available: false,
    href: '/quotes/new',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: 'express',
    title: 'Express Wash',
    description: 'Minimal express config',
    color: 'from-emerald-50 to-teal-50',
    textColor: 'text-emerald-700',
    available: false,
    href: '/quotes/new',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'conveyor',
    title: 'Conveyor System',
    description: 'Conveyor-focused build',
    color: 'from-amber-50 to-orange-50',
    textColor: 'text-amber-700',
    available: false,
    href: '/quotes/new',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /><circle cx="7" cy="17" r="1" /><circle cx="17" cy="17" r="1" />
      </svg>
    ),
  },
]

function TemplateSection() {
  return (
    <div className="mb-8">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        Start with a template
      </p>
      <div className="grid grid-cols-4 gap-3">
        {TEMPLATES.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${t.color} border border-slate-100 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className={`mb-3 ${t.textColor}`}>{t.icon}</div>
            <p className={`text-sm font-semibold ${t.textColor}`}>{t.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>
            {!t.available && (
              <span className="absolute right-2 top-2 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Soon
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: number; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-2xl px-6 py-5 ${
      accent ? 'bg-brand text-white' : 'bg-white text-ink border border-slate-100 shadow-sm'
    }`}>
      <p className={`text-[11px] font-semibold uppercase tracking-widest ${
        accent ? 'text-white/70' : 'text-slate-400'
      }`}>{label}</p>
      <p className={`mt-2 font-display text-4xl ${accent ? 'text-white' : 'text-ink'}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs ${accent ? 'text-white/60' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  )
}

// ── tab pill ──────────────────────────────────────────────────────────────────

function TabPill({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
        active ? 'bg-ink text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-ink'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
      }`}>
        {count}
      </span>
    </button>
  )
}

// ── preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({
  quote,
  selections,
  loading,
  onClose,
}: {
  quote: QuoteSummary | null
  selections: Record<string, SelectionValue> | null
  loading: boolean
  onClose: () => void
}) {
  const open = !!quote

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="font-semibold text-ink">
              {quote?.customer_name || 'Untitled Quote'}
            </p>
            {quote && (
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                quote.status === 'complete'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {quote.status === 'complete' ? 'Complete' : 'Draft'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
            </div>
          ) : !selections || Object.keys(selections).length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center text-slate-400">
              <p className="text-sm">No selections recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(selections)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {labelFromKey(key)}
                    </p>
                    <p className="mt-0.5 text-sm text-ink">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {quote && (
          <div className="border-t border-slate-100 p-4">
            <Link
              href={`/quotes/${quote.id}`}
              className="flex w-full items-center justify-center rounded-lg bg-brand py-2 text-sm font-semibold text-white transition hover:bg-ink"
            >
              Open Quote →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

// ── quote row ─────────────────────────────────────────────────────────────────

function QuoteRow({
  quote,
  deleting,
  cloning,
  togglingPin,
  previewOpen,
  onDelete,
  onClone,
  onTogglePin,
  onPreview,
}: {
  quote: QuoteSummary
  deleting: boolean
  cloning: boolean
  togglingPin: boolean
  previewOpen: boolean
  onDelete: () => void
  onClone: () => void
  onTogglePin: () => void
  onPreview: () => void
}) {
  const complete = quote.status === 'complete'

  return (
    <div className={`group flex items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-sm transition-all duration-150 hover:shadow-md ${
      previewOpen
        ? 'border-brand/40 shadow-md ring-1 ring-brand/20'
        : 'border-slate-100 hover:border-brand/30'
    }`}>
      {/* Pin button */}
      <button
        type="button"
        onClick={onTogglePin}
        disabled={togglingPin}
        title={quote.is_pinned ? 'Unpin' : 'Pin'}
        className={`shrink-0 transition-colors ${
          quote.is_pinned
            ? 'text-brand'
            : 'text-slate-200 hover:text-slate-400'
        } disabled:opacity-40`}
      >
        <PinIcon filled={quote.is_pinned} />
      </button>

      {/* Status icon */}
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
        complete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
      }`}>
        <DocIcon complete={complete} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink">
            {quote.customer_name || (
              <span className="font-normal italic text-slate-400">Untitled Quote</span>
            )}
          </p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {complete ? 'Complete' : 'Draft'}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
          <span>Edited {timeAgo(quote.updated_at)}</span>
          <span className="text-slate-200">·</span>
          <span>Created {shortDate(quote.created_at)}</span>
          <span className="text-slate-200">·</span>
          <span className="font-medium text-slate-500">{formatCurrency(quote.total_value ?? 0)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {/* Preview */}
        <button
          type="button"
          onClick={onPreview}
          title="Quick preview"
          className={`rounded-lg p-1.5 text-xs transition ${
            previewOpen
              ? 'bg-brand/10 text-brand'
              : 'text-slate-400 hover:bg-slate-100 hover:text-ink'
          }`}
        >
          <EyeIcon />
        </button>

        {/* Clone */}
        <button
          type="button"
          onClick={onClone}
          disabled={cloning}
          title="Clone quote"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink disabled:opacity-40"
        >
          {cloning ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
          ) : (
            <CopyIcon />
          )}
        </button>

        {/* Open */}
        <Link
          href={`/quotes/${quote.id}`}
          className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-ink"
        >
          Open
        </Link>

        {/* Delete */}
        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

// ── empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabKey }) {
  const copy = {
    all:      { title: 'No quotes yet',         sub: 'Create your first quote to get started.' },
    draft:    { title: 'No drafts in progress', sub: 'Quotes you start will appear here until completed.' },
    complete: { title: 'No completed quotes',   sub: 'Finish a quote in the configurator to see it here.' },
  }[tab]

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <p className="font-semibold text-slate-500">{copy.title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-400">{copy.sub}</p>
      {tab !== 'complete' && (
        <Link
          href="/quotes/new"
          className="mt-6 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink"
        >
          + New Quote
        </Link>
      )}
    </div>
  )
}

// ── main dashboard ────────────────────────────────────────────────────────────

export default function QuoteDashboard({
  initialQuotes,
  userName,
}: {
  initialQuotes: QuoteSummary[]
  userName: string
}) {
  const router = useRouter()
  const [quotes, setQuotes] = useState(initialQuotes)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [cloning, setCloning] = useState<string | null>(null)
  const [togglingPin, setTogglingPin] = useState<string | null>(null)

  // Preview panel state
  const [previewQuote, setPreviewQuote] = useState<QuoteSummary | null>(null)
  const [previewSelections, setPreviewSelections] = useState<Record<string, SelectionValue> | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    return {
      total:     quotes.length,
      drafts:    quotes.filter((q) => q.status === 'draft').length,
      completed: quotes.filter((q) => q.status === 'complete').length,
      thisMonth: quotes.filter((q) => new Date(q.updated_at).getTime() >= monthStart).length,
    }
  }, [quotes])

  // Filter → sort
  const processed = useMemo(() => {
    const filtered = quotes.filter((q) => {
      if (activeTab !== 'all' && q.status !== activeTab) return false
      if (search.trim()) {
        const term = search.trim().toLowerCase()
        if (!q.customer_name.toLowerCase().includes(term)) return false
      }
      return true
    })
    return sortQuotes(filtered, sort)
  }, [quotes, activeTab, search, sort])

  // Split pinned vs unpinned
  const pinned   = useMemo(() => processed.filter((q) => q.is_pinned), [processed])
  const unpinned = useMemo(() => processed.filter((q) => !q.is_pinned), [processed])

  // Groups only apply for time-based sorts; alphabetical gets a flat list
  const useGroups = sort === 'newest' || sort === 'oldest'
  const groups = useMemo(() => useGroups ? groupByRecency(unpinned) : [], [unpinned, useGroups])

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (id: string, name: string) => {
    const label = name || 'this untitled quote'
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
    setDeleting(id)
    if (previewQuote?.id === id) setPreviewQuote(null)
    await deleteQuote(id)
    setQuotes((prev) => prev.filter((q) => q.id !== id))
    setDeleting(null)
  }, [previewQuote])

  const handleClone = useCallback(async (id: string) => {
    setCloning(id)
    const cloned = await cloneQuote(id)
    setQuotes((prev) => [cloned, ...prev])
    setCloning(null)
  }, [])

  const handleTogglePin = useCallback(async (id: string, currentlyPinned: boolean) => {
    setTogglingPin(id)
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_pinned: !currentlyPinned } : q))
    )
    await togglePin(id, currentlyPinned)
    setTogglingPin(null)
  }, [])

  const handlePreview = useCallback(async (quote: QuoteSummary) => {
    if (previewQuote?.id === quote.id) {
      setPreviewQuote(null)
      setPreviewSelections(null)
      return
    }
    setPreviewQuote(quote)
    setPreviewSelections(null)
    setPreviewLoading(true)
    const sel = await getQuoteSelections(quote.id)
    setPreviewSelections(sel)
    setPreviewLoading(false)
  }, [previewQuote])

  // ── render helpers ───────────────────────────────────────────────────────────

  function renderRow(q: QuoteSummary) {
    return (
      <QuoteRow
        key={q.id}
        quote={q}
        deleting={deleting === q.id}
        cloning={cloning === q.id}
        togglingPin={togglingPin === q.id}
        previewOpen={previewQuote?.id === q.id}
        onDelete={() => handleDelete(q.id, q.customer_name)}
        onClone={() => handleClone(q.id)}
        onTogglePin={() => handleTogglePin(q.id, q.is_pinned)}
        onPreview={() => handlePreview(q)}
      />
    )
  }

  return (
    <>
      {/* Preview Panel */}
      <PreviewPanel
        quote={previewQuote}
        selections={previewSelections}
        loading={previewLoading}
        onClose={() => { setPreviewQuote(null); setPreviewSelections(null) }}
      />

      <div className="min-h-screen bg-paper">
        <div className="mx-auto max-w-5xl px-8 py-10">

          {/* ── Greeting ── */}
          <GreetingBanner name={userName} />

          {/* ── Header ── */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Quotes</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your quotes — open drafts to continue or review completed history.
              </p>
            </div>
            <Link
              href="/quotes/new"
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink"
            >
              + New Quote
            </Link>
          </div>

          {/* ── Templates ── */}
          <TemplateSection />

          {/* ── Stat cards ── */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <StatCard label="Total Quotes"  value={stats.total}     sub="All time"        accent />
            <StatCard label="Active Drafts" value={stats.drafts}    sub="In progress" />
            <StatCard label="Completed"     value={stats.completed} sub="Finalized" />
            <StatCard label="This Month"    value={stats.thisMonth} sub="Recently active" />
          </div>

          {/* ── Toolbar ── */}
          <div className="mb-5 flex items-center justify-between gap-4">
            {/* Tab pills */}
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              <TabPill label="All"     count={stats.total}     active={activeTab === 'all'}      onClick={() => setActiveTab('all')} />
              <TabPill label="Drafts"  count={stats.drafts}    active={activeTab === 'draft'}    onClick={() => setActiveTab('draft')} />
              <TabPill label="History" count={stats.completed} active={activeTab === 'complete'} onClick={() => setActiveTab('complete')} />
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>

              {/* Search */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search by customer…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
          </div>

          {/* ── Quote list ── */}
          {processed.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="space-y-6">
              {/* Pinned section */}
              {pinned.length > 0 && (
                <div>
                  <p className="mb-2 ml-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    <PinIcon filled /> Pinned
                  </p>
                  <div className="space-y-2">
                    {pinned.map(renderRow)}
                  </div>
                </div>
              )}

              {/* Date-grouped or flat list */}
              {useGroups ? (
                groups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 ml-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.items.map(renderRow)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {unpinned.map(renderRow)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
