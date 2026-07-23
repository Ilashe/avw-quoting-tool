// Applies migration 0016 directly via service-role client (same approach as 0012/0014/0015).
// Mirrors supabase/migrations/0016_blower_hp_colors_spinning_wheel_blaster.sql exactly.
// Safe to re-run (cleanup-then-insert pattern).

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

async function itemId(sku) {
  const { data, error } = await supabase.from('equipment_items').select('id, category_id').eq('sku', sku).single()
  check(`lookup ${sku}`, error)
  return data
}

async function resetOptions(sku, fieldKey, options) {
  const item = await itemId(sku)
  const { error: delErr } = await supabase.from('equipment_options').delete().eq('item_id', item.id)
  check(`${sku}: clear options`, delErr)
  const { error: insErr } = await supabase.from('equipment_options').insert(
    options.map(([option_label, option_value], i) => ({
      item_id: item.id,
      option_key: fieldKey,
      option_label,
      option_value,
      sort_order: i + 1,
    }))
  )
  check(`${sku}: insert options`, insErr)
}

// ── 1) Blower HP class (EQ-BLOW-001A) ───────────────────────────────────────

{
  const { error } = await supabase.from('equipment_items').delete().eq('sku', 'EQ-BLOW-001A')
  check('delete existing EQ-BLOW-001A', error)

  const blow001 = await itemId('EQ-BLOW-001')
  const { error: insErr } = await supabase.from('equipment_items').insert({
    sku: 'EQ-BLOW-001A',
    name: '10 HP or 15 HP Blower?',
    category_id: blow001.category_id,
    unit_price: 0,
    metadata: { field_key: 'blower_hp_class', widget: 'radio' },
  })
  check('insert EQ-BLOW-001A', insErr)

  await resetOptions('EQ-BLOW-001A', 'blower_hp_class', [
    ['10 HP', '10hp'],
    ['15 HP', '15hp'],
  ])
  console.log('Blower HP class field added.')
}

// ── 2) Colors -> Black/Blue/Red ─────────────────────────────────────────────

await resetOptions('EQ-CONV-006', 'pit_grate_color', [
  ['Black', 'black'], ['Blue', 'blue'], ['Red', 'red'], ['None', 'none'],
])
console.log('Pit Grate Color: Black/Blue/Red/None.')

await resetOptions('EQ-BELT-005', 'belt_color', [
  ['Black', 'black'], ['Blue', 'blue'], ['Red', 'red'], ['No', 'no'],
])
console.log('Belt Color: Black/Blue/Red/No.')

await resetOptions('EQ-BELT-006', 'flight_color', [
  ['Black', 'black'], ['Blue', 'blue'], ['Red', 'red'], ['No', 'no'],
])
console.log('Flight Color: Black/Blue/Red/No.')

await resetOptions('EQ-BELT-008', 'safety_stripe_color', [
  ['Black', 'black'], ['Blue', 'blue'], ['Red', 'red'], ['No', 'no'],
])
console.log('Safety Stripe Color: Black/Blue/Red/No.')

// Blower Color -> Black/Blue/Red, remove Orange/Green/Yellow Type-of-Blowers sub-pickers
{
  const { error: ruleDelErr } = await supabase
    .from('dependency_rules')
    .delete()
    .in('rule_name', [
      'eq_blower_seed_type_show_orange',
      'eq_blower_seed_type_show_green',
      'eq_blower_seed_type_show_yellow',
      'eq_blower_seed_type_show_red',
    ])
  check('delete blower color rules', ruleDelErr)

  const { error: itemDelErr } = await supabase
    .from('equipment_items')
    .delete()
    .in('sku', ['EQ-BLOW-005', 'EQ-BLOW-006', 'EQ-BLOW-008'])
  check('delete orange/green/yellow Type of Blowers items', itemDelErr)

  await resetOptions('EQ-BLOW-003', 'blower_color', [
    ['Black', 'black'], ['Blue', 'blue'], ['Red', 'red'],
  ])
  console.log('Blower Color: Black/Blue/Red.')

  const blow004 = await itemId('EQ-BLOW-004')
  const { error: insErr } = await supabase.from('equipment_items').insert({
    sku: 'EQ-BLOW-005',
    name: 'Type of Blowers',
    category_id: blow004.category_id,
    unit_price: 0,
    metadata: { field_key: 'type_of_blowers_red', widget: 'select' },
  })
  check('insert Type of Blowers - Red item', insErr)

  await resetOptions('EQ-BLOW-005', 'type_of_blowers_red', [
    ['1HP-Red-5 Nozzle', '1hp_red_5n'],
    ['2HP-Red-12 Nozzle', '2hp_red_12n'],
    ['3HP-Red-18 Nozzle', '3hp_red_18n'],
    ['4HP-Red-24 Nozzle', '4hp_red_24n'],
    ['5HP-Red-32 Nozzle', '5hp_red_32n'],
  ])

  const { error: ruleInsErr } = await supabase.from('dependency_rules').insert({
    rule_name: 'eq_blower_seed_type_show_red',
    trigger_field: 'blower_color',
    trigger_value: 'red',
    action_type: 'show',
    target_field: 'type_of_blowers_red',
    target_value: null,
  })
  check('insert red show rule', ruleInsErr)
  console.log('Type of Blowers - Red: mapped with 1-5HP/5-32 Nozzle pattern.')
}

// ── 3) Spinning Wheel Blaster (EQ-HP-003A) ──────────────────────────────────

{
  const { error } = await supabase.from('equipment_items').delete().eq('sku', 'EQ-HP-003A')
  check('delete existing EQ-HP-003A', error)

  const hp003 = await itemId('EQ-HP-003')
  const { error: insErr } = await supabase.from('equipment_items').insert({
    sku: 'EQ-HP-003A',
    name: 'Spinning Wheel Blaster',
    category_id: hp003.category_id,
    unit_price: 0,
    metadata: { field_key: 'spinning_wheel_blaster', widget: 'pending' },
  })
  check('insert EQ-HP-003A', insErr)
  console.log('Spinning Wheel Blaster field added (pending).')
}

console.log('Migration 0016 applied successfully.')
