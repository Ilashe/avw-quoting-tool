import QuoteReview from '@/components/quotes/QuoteReview'

// Deliberately thin: no database calls here. The parent (app) layout and the proxy already
// guard authentication, and QuoteReview renders from the configurator's in-memory state, so
// opening this page costs one light server render instead of a full quote fetch.
export default async function QuoteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <QuoteReview key={id} quoteId={id} />
}
