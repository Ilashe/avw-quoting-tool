import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuoteReview from '@/components/quotes/QuoteReview'
import { formatQuoteNumber } from '@/lib/quote/quoteNumber'
import type { SelectionValue } from '@/store/selectionsStore'
import type { LineItem } from '@/types/parts'

export default async function QuoteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // select('*') rather than a column list so the page still renders on a database where
  // migration 0069 (quotes.quote_number) hasn't been applied yet — see formatQuoteNumber.
  const { data: quote, error } = await supabase.from('quotes').select('*').eq('id', id).single()
  if (error || !quote) redirect('/quotes')

  return (
    <QuoteReview
      key={quote.id}
      quoteId={quote.id}
      quoteNumber={formatQuoteNumber(quote.quote_number, quote.id)}
      initialSelections={(quote.selections ?? {}) as Record<string, SelectionValue>}
      initialLineItems={(quote.line_items ?? []) as LineItem[]}
    />
  )
}
