// Phase 1 of the Equipment Options reconciliation: 3 confirmed missing-core-row bugs plus one
// missing fixed-part rule, found by a read-only audit comparing live part_bundle_rules against
// master_prompt_full_rebuild.md. Pure data fixes — no schema change needed. Safe to re-run
// (each block deletes its own rows before re-inserting the correct set for that trigger).

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

function check(label, error) {
  if (error) {
    console.error(`FAILED at ${label}:`, error.message)
    process.exit(1)
  }
}

async function addCoreRowIfMissing(triggerPartNumber, requiredPartNumber, quantity, sortOrder) {
  const { data: existing, error: selErr } = await supabase
    .from('part_bundle_rules')
    .select('id')
    .eq('trigger_part_number', triggerPartNumber)
    .is('choice_group', null)
    .eq('required_part_number', requiredPartNumber)
  check(`${triggerPartNumber}: check existing ${requiredPartNumber}`, selErr)

  if (existing.length > 0) {
    console.log(`${triggerPartNumber}: ${requiredPartNumber} core row already present, skipping.`)
    return
  }

  const { error: insErr } = await supabase.from('part_bundle_rules').insert({
    trigger_part_number: triggerPartNumber,
    choice_group: null,
    choice_subgroup: null,
    choice_label: null,
    required_part_number: requiredPartNumber,
    quantity,
    sort_order: sortOrder,
  })
  check(`${triggerPartNumber}: insert ${requiredPartNumber}`, insErr)
  console.log(`${triggerPartNumber}: added missing core row ${quantity}x ${requiredPartNumber}.`)
}

// 1) 2WAMC2CB0405 — missing 2x CB0405AMC-23-13 (lower contour core). Sibling 2WAMC2CB0405-EL
//    already has both lower+upper cores.
await addCoreRowIfMissing('2WAMC2CB0405', 'CB0405AMC-23-13', 2, 0)

// 2) OT2-WACB0405 — same gap, same fix. Sibling OT2-WACB0405-EL already has both cores.
await addCoreRowIfMissing('OT2-WACB0405', 'CB0405AMC-23-13', 2, 0)

// 3) OT2-WACB2 / OT2-WACB2-EL — missing ALL core rows (no contour cores, no wrap core).
for (const trigger of ['OT2-WACB2', 'OT2-WACB2-EL']) {
  await addCoreRowIfMissing(trigger, 'CB1AMC-23-13', 2, 0)
  await addCoreRowIfMissing(trigger, 'CB1AMC-50-13', 2, 1)
  await addCoreRowIfMissing(trigger, 'WA1M-72-510-5220-CORE', 2, 2)
}

// 4) TB3-0325 — should follow the exact same fixed-part pattern as TB2-0325/TB3-EL-0325 (Tire
//    Dressing Applicator: no customer choice, one fixed part x2). Currently has zero rules.
await addCoreRowIfMissing('TB3-0325', 'TB1ADEA-4B-008-104-FTHR-PE-AVW', 2, 0)

console.log('Phase 1 complete.')
