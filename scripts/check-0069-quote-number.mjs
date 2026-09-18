// Read-only check that migration 0069 (quotes.quote_number + its sequence default) is live.
// Inserts one throwaway quote to prove the DEFAULT fires, then deletes it again.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function loadEnvLocal() {
  const text = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    if (match) process.env[match[1]] ??= match[2]
  }
}
loadEnvLocal()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const { data, error } = await supabase
  .from('quotes')
  .select('id, user_id, customer_name, quote_number, status, total_value, created_at')
  .order('created_at')

if (error) {
  console.log('FAILED:', error.message)
  process.exit(1)
}

console.log('quotes.quote_number column: PRESENT')
console.log(`existing rows: ${data.length}`)
for (const q of data) {
  const num = q.quote_number ?? '(null)'
  const total = Number(q.total_value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  console.log(`  #${String(num).padEnd(7)} ${q.status.padEnd(8)} ${total.padStart(14)}  ${q.customer_name || '(unnamed)'}`)
}
console.log(`backfill gaps (quote_number null): ${data.filter((q) => q.quote_number == null).length}`)

const { data: probe, error: insertError } = await supabase
  .from('quotes')
  .insert({ user_id: data[0].user_id, customer_name: '__0069_probe__', selections: {}, status: 'draft' })
  .select('id, quote_number')
  .single()

if (insertError) {
  console.log('insert probe FAILED:', insertError.message)
  process.exit(1)
}
console.log(`new insert auto-assigned quote_number: ${probe.quote_number}`)
await supabase.from('quotes').delete().eq('id', probe.id)
console.log('probe row deleted')
