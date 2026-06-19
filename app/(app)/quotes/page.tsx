import Link from 'next/link'

export default function QuotesPage() {
  return (
    <div className="p-8">
      <h1 className="font-display text-lg uppercase tracking-wide text-ink">Quotes</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The quote dashboard — save/load, revision history, and a real list of quotes — is built
        in Phase 9. For now, jump into the configurator shell directly:
      </p>
      <Link
        href="/quotes/new"
        className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Open Configurator
      </Link>
    </div>
  )
}
