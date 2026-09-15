// Migration 0069: reorder "Conveyor Length" to sort directly above "Voltage" in the Conveyor
// section, per client instruction (2026-09-13). EquipmentTab.tsx sorts fields by SKU string
// within a category, so this is a pure SKU rename (EQ-CONV-003 -> EQ-CONV-002B1, sorting between
// Horsepower/002B and Voltage/002C) — name and metadata (field_key, helper text/links, etc.)
// untouched, so nothing else about the field changes. Safe to re-run (no-op if already renamed).

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function loadEnvLocal() {
  const path = join(process.cwd(), '.env.local')
  const text = readFileSync(path, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    if (match) process.env[match[1]] ??= match[2]
  }
}
loadEnvLocal()

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function main() {
  const { error } = await supabase.from('equipment_items').update({ sku: 'EQ-CONV-002B1' }).eq('sku', 'EQ-CONV-003')
  if (error) {
    console.error('FAILED:', error.message)
    process.exit(1)
  }
  console.log('EQ-CONV-003 (Conveyor Length) -> EQ-CONV-002B1 — now sorts between Horsepower and Voltage.')
}

main()
