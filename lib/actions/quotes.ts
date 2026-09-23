'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SelectionValue } from '@/store/selectionsStore'
import type { LineItem } from '@/types/parts'
import { computeQuoteTotal, equipmentOptionsTotal } from '@/lib/pricing'
import { buildConveyorPartNumber, conveyorInputsFromSelections } from '@/lib/conveyor/beltPartNumber'
import { buildBlowerPart, blowerInputsFromSelections } from '@/lib/blower/blowerPartNumber'
import type { EquipmentItem, EquipmentOption } from '@/types/equipment'

export interface QuoteSummary {
  id: string
  customer_name: string
  status: string
  is_pinned: boolean
  total_value: number
  created_at: string
  updated_at: string
}

export interface QuoteRow extends QuoteSummary {
  selections: Record<string, SelectionValue>
  line_items: LineItem[]
}

async function authedSupabase() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user.id, user }
}

// ── user ──────────────────────────────────────────────────────────────────────

export async function getUserName(): Promise<string> {
  const { user } = await authedSupabase()
  const meta = (user.user_metadata ?? {}) as Record<string, string>
  const full = meta.full_name ?? meta.name ?? ''
  if (full) return full.split(' ')[0]
  // Fall back to the part of the email before @
  const local = (user.email ?? 'there').split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

// ── create / read ─────────────────────────────────────────────────────────────

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

export async function getQuote(quoteId: string): Promise<QuoteRow | null> {
  const { supabase } = await authedSupabase()
  const { data } = await supabase.from('quotes').select('*').eq('id', quoteId).single()
  return (data as QuoteRow) ?? null
}

export async function getQuoteSelections(
  quoteId: string
): Promise<Record<string, SelectionValue>> {
  const { supabase } = await authedSupabase()
  const { data } = await supabase
    .from('quotes')
    .select('selections')
    .eq('id', quoteId)
    .single()
  return ((data as { selections: Record<string, SelectionValue> } | null)?.selections ?? {})
}

export async function getQuoteLineItems(quoteId: string): Promise<LineItem[]> {
  const { supabase } = await authedSupabase()
  const { data } = await supabase
    .from('quotes')
    .select('line_items')
    .eq('id', quoteId)
    .single()
  return ((data as { line_items: LineItem[] } | null)?.line_items ?? [])
}

export async function getUserQuotes(): Promise<QuoteSummary[]> {
  const { supabase } = await authedSupabase()
  const { data } = await supabase
    .from('quotes')
    .select('id, customer_name, status, is_pinned, total_value, created_at, updated_at')
    .order('updated_at', { ascending: false })
  return (data ?? []) as QuoteSummary[]
}

// ── save ──────────────────────────────────────────────────────────────────────

// Server-side twin of useConveyorPart: the persisted total_value must include the generated
// belt conveyor part's real price, same as the live TopBar/SummaryPanel totals.
async function conveyorPartPrice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selections: Record<string, SelectionValue>
): Promise<number> {
  const partNumber = buildConveyorPartNumber(conveyorInputsFromSelections(selections))
  if (!partNumber) return 0
  const { data } = await supabase.from('parts').select('unit_price').eq('part_number', partNumber).maybeSingle()
  return (data as { unit_price: number | null } | null)?.unit_price ?? 0
}

// Server-side twin of the client's useEquipmentCatalog(null) — same query shape, fetches the
// whole catalog so equipmentOptionsTotal can price whatever's currently selected.
async function equipmentOptionsPrice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selections: Record<string, SelectionValue>
): Promise<number> {
  const { data } = await supabase.from('equipment_items').select('*, equipment_options(*)').eq('is_active', true)
  type ItemRow = EquipmentItem & { equipment_options: EquipmentOption[] }
  const rows = (data ?? []) as ItemRow[]
  const items: EquipmentItem[] = rows.map(({ equipment_options, ...item }) => item)
  const options: EquipmentOption[] = rows.flatMap((row) => row.equipment_options ?? [])
  return equipmentOptionsTotal(items, options, selections)
}

async function quoteTotal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  selections: Record<string, SelectionValue>,
  lineItems: LineItem[]
): Promise<number> {
  const conveyorPrice = await conveyorPartPrice(supabase, selections)
  const optionsPrice = await equipmentOptionsPrice(supabase, selections)
  const blowerPart = buildBlowerPart(blowerInputsFromSelections(selections))
  const blowerPrice = blowerPart ? blowerPart.price * (Number(selections['number_of_blowers']) || 1) : 0
  return computeQuoteTotal(
    lineItems,
    selections,
    selections['items_discount_percent'] as number | null,
    conveyorPrice,
    optionsPrice + blowerPrice
  )
}

export async function saveQuote(
  quoteId: string,
  selections: Record<string, SelectionValue>,
  lineItems: LineItem[] = []
): Promise<void> {
  const { supabase } = await authedSupabase()
  const customerName = String(selections['customer'] ?? '')
  const totalValue = await quoteTotal(supabase, selections, lineItems)
  await supabase
    .from('quotes')
    .update({ selections, line_items: lineItems, customer_name: customerName, total_value: totalValue })
    .eq('id', quoteId)
}

export async function finishQuote(
  quoteId: string,
  selections: Record<string, SelectionValue>,
  lineItems: LineItem[] = []
): Promise<void> {
  const { supabase } = await authedSupabase()
  const customerName = String(selections['customer'] ?? '')
  const totalValue = await quoteTotal(supabase, selections, lineItems)
  await supabase
    .from('quotes')
    .update({
      selections,
      line_items: lineItems,
      customer_name: customerName,
      total_value: totalValue,
      status: 'complete',
    })
    .eq('id', quoteId)
  revalidatePath('/quotes')
}

export async function revertToDraft(quoteId: string): Promise<void> {
  const { supabase } = await authedSupabase()
  await supabase.from('quotes').update({ status: 'draft' }).eq('id', quoteId)
}

// ── pin ───────────────────────────────────────────────────────────────────────

export async function togglePin(quoteId: string, currentlyPinned: boolean): Promise<void> {
  const { supabase } = await authedSupabase()
  await supabase.from('quotes').update({ is_pinned: !currentlyPinned }).eq('id', quoteId)
  revalidatePath('/quotes')
}

// ── clone ─────────────────────────────────────────────────────────────────────

export async function cloneQuote(quoteId: string): Promise<QuoteSummary> {
  const { supabase, userId } = await authedSupabase()
  const { data: original } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()
  if (!original) throw new Error('Quote not found')

  const clonedName = original.customer_name
    ? `Copy of ${original.customer_name}`
    : 'Copy'

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      user_id: userId,
      customer_name: clonedName,
      selections: original.selections,
      line_items: original.line_items,
      total_value: original.total_value,
      status: 'draft',
    })
    .select('id, customer_name, status, is_pinned, total_value, created_at, updated_at')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to clone quote')
  revalidatePath('/quotes')
  return data as QuoteSummary
}

// ── delete ────────────────────────────────────────────────────────────────────

export async function deleteQuote(quoteId: string): Promise<void> {
  const { supabase } = await authedSupabase()
  await supabase.from('quotes').delete().eq('id', quoteId)
  revalidatePath('/quotes')
}
