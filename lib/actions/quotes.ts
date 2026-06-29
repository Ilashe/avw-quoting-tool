'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SelectionValue } from '@/store/selectionsStore'

export interface QuoteSummary {
  id: string
  customer_name: string
  status: string
  created_at: string
  updated_at: string
}

export interface QuoteRow extends QuoteSummary {
  selections: Record<string, SelectionValue>
}

async function authedSupabase() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user.id }
}

export async function createNewQuote(): Promise<string> {
  const { supabase, userId } = await authedSupabase()
  const { data, error } = await supabase
    .from('quotes')
    .insert({ user_id: userId, customer_name: '', selections: {}, status: 'draft' })
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create quote')
  return data.id as string
}

export async function saveQuote(
  quoteId: string,
  selections: Record<string, SelectionValue>
): Promise<void> {
  const { supabase } = await authedSupabase()
  const customerName = String(selections['customer'] ?? '')
  await supabase
    .from('quotes')
    .update({ selections, customer_name: customerName })
    .eq('id', quoteId)
}

export async function getQuote(quoteId: string): Promise<QuoteRow | null> {
  const { supabase } = await authedSupabase()
  const { data } = await supabase.from('quotes').select('*').eq('id', quoteId).single()
  return (data as QuoteRow) ?? null
}

export async function getUserQuotes(): Promise<QuoteSummary[]> {
  const { supabase } = await authedSupabase()
  const { data } = await supabase
    .from('quotes')
    .select('id, customer_name, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
  return (data ?? []) as QuoteSummary[]
}

export async function deleteQuote(quoteId: string): Promise<void> {
  const { supabase } = await authedSupabase()
  await supabase.from('quotes').delete().eq('id', quoteId)
  revalidatePath('/quotes')
}
