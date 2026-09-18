import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConfiguratorShell from '@/components/configurator/ConfiguratorShell'
import type { SelectionValue } from '@/store/selectionsStore'
import type { LineItem } from '@/types/parts'
import { ALL_TABS, type TabKey } from '@/store/configuratorStore'

export default async function QuoteConfiguratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
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

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, customer_name, selections, line_items, status')
    .eq('id', id)
    .single()

  if (error || !quote) redirect('/quotes')

  return (
    <ConfiguratorShell
      key={quote.id}
      quoteId={quote.id}
      initialTab={(ALL_TABS as readonly string[]).includes(tab ?? '') ? (tab as TabKey) : undefined}
      initialSelections={(quote.selections ?? {}) as Record<string, SelectionValue>}
      initialLineItems={(quote.line_items ?? []) as LineItem[]}
      initialStatus={(quote.status as string) ?? 'draft'}
    />
  )
}
