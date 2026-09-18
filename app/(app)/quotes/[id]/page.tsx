import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConfiguratorShell from '@/components/configurator/ConfiguratorShell'
import type { SelectionValue } from '@/store/selectionsStore'
import type { LineItem } from '@/types/parts'

export default async function QuoteConfiguratorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (id === 'new') {
    const { data, error } = await supabase
      .from('quotes')
      .insert({ user_id: user.id, customer_name: '', selections: {}, status: 'draft' })
      .select('id')
      .single()
    if (error || !data) redirect('/quotes')
    redirect(`/quotes/${data.id}`)
  }

  // select('*') rather than a column list so the page still renders on a database where
  // migration 0069 (quotes.quote_number) hasn't been applied yet — quoteNumber falls back below.
  const { data: quote, error } = await supabase.from('quotes').select('*').eq('id', id).single()

  if (error || !quote) redirect('/quotes')

  return (
    <ConfiguratorShell
      key={quote.id}
      quoteId={quote.id}
      quoteNumber={formatQuoteNumber(quote.quote_number, quote.id)}
      initialSelections={(quote.selections ?? {}) as Record<string, SelectionValue>}
      initialLineItems={(quote.line_items ?? []) as LineItem[]}
      initialStatus={(quote.status as string) ?? 'draft'}
    />
  )
}

/** The sequential number from migration 0069, or a stable id-derived stand-in without it. */
function formatQuoteNumber(quoteNumber: unknown, quoteId: string): string {
  if (typeof quoteNumber === 'number') return String(quoteNumber)
  const hex = quoteId.replace(/-/g, '').slice(-6)
  return String(100000 + (parseInt(hex, 16) % 900000))
}
