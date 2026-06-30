import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConfiguratorShell from '@/components/configurator/ConfiguratorShell'
import type { SelectionValue } from '@/store/selectionsStore'

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

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, customer_name, selections, status')
    .eq('id', id)
    .single()

  if (error || !quote) redirect('/quotes')

  return (
    <ConfiguratorShell
      key={quote.id}
      quoteId={quote.id}
      initialSelections={(quote.selections ?? {}) as Record<string, SelectionValue>}
      initialStatus={(quote.status as string) ?? 'draft'}
    />
  )
}
