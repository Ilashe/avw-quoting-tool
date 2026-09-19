import Image from 'next/image'

/**
 * Full-screen loading state for the Review page. Shown by the configurator the instant Next →
 * Review is clicked (while the quote saves and the route loads) and by the route's loading.tsx
 * (while the page renders). Both use this same markup, so the hand-off between them is seamless.
 * Server-safe on purpose: no hooks, CSS-only animation.
 */
export default function ReviewLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/90 backdrop-blur-sm"
    >
      <div className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-mist border-t-brand" />
        <Image src="/avw-logo.png" alt="" width={44} height={44} className="animate-pulse" />
      </div>

      <div className="text-center">
        <p className="font-display text-2xl uppercase tracking-wide text-ink">Preparing your review</p>
        <p className="mt-1 text-sm text-slate-500">Saving your quote and gathering everything you selected…</p>
      </div>

      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-mist">
        <div className="review-progress-bar h-full w-1/3 rounded-full bg-brand" />
      </div>
    </div>
  )
}
