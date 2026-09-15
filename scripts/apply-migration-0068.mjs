// Applies migration 0068 directly via service-role client (same approach as 0012/0014/0015/0016).
// Mirrors supabase/migrations/0068_conveyor_series_config_fields.sql.
// Safe to re-run (delete-then-insert on both equipment_items and their options).

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

async function upsertSelectField(sku, name, fieldKey, categoryId, options) {
  const { data: existing, error: lookupErr } = await supabase
    .from('equipment_items')
    .select('id')
    .eq('sku', sku)
    .maybeSingle()
  check(`${sku}: lookup existing item`, lookupErr)

  if (existing) {
    const { error: delOptErr } = await supabase.from('equipment_options').delete().eq('item_id', existing.id)
    check(`${sku}: clear stale options`, delOptErr)
    const { error: delItemErr } = await supabase.from('equipment_items').delete().eq('id', existing.id)
    check(`${sku}: delete existing item`, delItemErr)
  }

  const { data: item, error: insErr } = await supabase
    .from('equipment_items')
    .insert({
      sku,
      name,
      category_id: categoryId,
      unit_price: 0,
      metadata: { widget: 'select', field_key: fieldKey },
    })
    .select('id')
    .single()
  check(`${sku}: insert item`, insErr)

  const { error: optErr } = await supabase.from('equipment_options').insert(
    options.map(([option_label, option_value], i) => ({
      item_id: item.id,
      option_key: fieldKey,
      option_label,
      option_value,
      sort_order: i + 1,
    }))
  )
  check(`${sku}: insert options`, optErr)
  console.log(`${sku} "${name}" added with ${options.length} option(s).`)
}

async function main() {
  const { data: conveyorCategory, error } = await supabase
    .from('categories')
    .select('id')
    .eq('section', 'conveyor')
    .single()
  check('lookup Conveyor category', error)

  await upsertSelectField('EQ-CONV-002A1', 'Series', 'conveyor_series', conveyorCategory.id, [
    ['BC - 30 inches', 'bc_30_inches'],
  ])

  await upsertSelectField('EQ-CONV-002A2', 'Config', 'conveyor_config', conveyorCategory.id, [
    ['3', '3'],
    ['6', '6'],
    ['7', '7'],
    ['8', '8'],
  ])

  console.log('Migration 0068 applied successfully.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
