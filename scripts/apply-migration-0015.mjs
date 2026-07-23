// Applies migration 0015 directly via service-role client (same approach as 0012/0014).
// Mirrors supabase/migrations/0015_applicator_arches_octa_selection.sql exactly.
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

// ── Reset EQ-FRIN-001 to the new 4-option radio ─────────────────────────────

{
  const { error } = await supabase
    .from('dependency_rules')
    .delete()
    .in('rule_name', [
      'eq_frin_001a_applicator_arches_parts_show',
      'eq_frin_001a_zero_octa_parts_show',
      'eq_frin_001b_single_octa_parts_show',
      'eq_frin_001c_double_octa_parts_show',
      'eq_frin_001d_triple_octa_parts_show',
    ])
  check('delete old rules', error)

  const { error: delItemsErr } = await supabase
    .from('equipment_items')
    .delete()
    .in('sku', ['EQ-FRIN-001A', 'EQ-FRIN-001B', 'EQ-FRIN-001C', 'EQ-FRIN-001D'])
  check('delete old picker items', delItemsErr)

  const { error: metaErr } = await supabase
    .from('equipment_items')
    .update({ metadata: { field_key: 'applicator_arches', widget: 'radio' } })
    .eq('sku', 'EQ-FRIN-001')
  check('reset EQ-FRIN-001 metadata', metaErr)

  const base = await itemId('EQ-FRIN-001')
  const { error: optDelErr } = await supabase.from('equipment_options').delete().eq('item_id', base.id)
  check('clear EQ-FRIN-001 options', optDelErr)

  const { error: optInsErr } = await supabase.from('equipment_options').insert([
    { item_id: base.id, option_key: 'applicator_arches', option_label: 'Zero Octa', option_value: 'zero_octa', sort_order: 1 },
    { item_id: base.id, option_key: 'applicator_arches', option_label: 'Single Octa', option_value: 'single_octa', sort_order: 2 },
    { item_id: base.id, option_key: 'applicator_arches', option_label: 'Double Octa', option_value: 'double_octa', sort_order: 3 },
    { item_id: base.id, option_key: 'applicator_arches', option_label: 'Triple Octa', option_value: 'triple_octa', sort_order: 4 },
  ])
  check('insert 4-option radio', optInsErr)
  console.log('EQ-FRIN-001: reset to Zero/Single/Double/Triple Octa radio.')
}

const GROUPS = [
  {
    sku: 'EQ-FRIN-001A',
    name: 'Applicator Arches - Zero Octa Selection',
    fieldKey: 'applicator_arches_zero_octa_parts',
    triggerValue: 'zero_octa',
    ruleName: 'eq_frin_001a_zero_octa_parts_show',
    parts: ['OT2-AA0', 'OT2-AA0-0622', 'OT2-AA0-14'],
  },
  {
    sku: 'EQ-FRIN-001B',
    name: 'Applicator Arches - Single Octa Selection',
    fieldKey: 'applicator_arches_single_octa_parts',
    triggerValue: 'single_octa',
    ruleName: 'eq_frin_001b_single_octa_parts_show',
    parts: ['OT2-AA1', 'OT2-AA1-HP1', 'OT2-AA1A', 'OT2-AA1A-0622', 'OT2-AA1X3'],
  },
  {
    sku: 'EQ-FRIN-001C',
    name: 'Applicator Arches - Double Octa Selection',
    fieldKey: 'applicator_arches_double_octa_parts',
    triggerValue: 'double_octa',
    ruleName: 'eq_frin_001c_double_octa_parts_show',
    parts: ['OT2-AA2', 'OT2-AA2A', 'OT2-AA2A-0622', 'OT2-AA2B', 'OT2-AA2X3', 'OT2-AA2X3-0622'],
  },
  {
    sku: 'EQ-FRIN-001D',
    name: 'Applicator Arches - Triple Octa Selection',
    fieldKey: 'applicator_arches_triple_octa_parts',
    triggerValue: 'triple_octa',
    ruleName: 'eq_frin_001d_triple_octa_parts_show',
    parts: ['OT2-AA3X3-0622'],
  },
]

const base = await itemId('EQ-FRIN-001')

for (const g of GROUPS) {
  const { error: insErr } = await supabase.from('equipment_items').insert({
    sku: g.sku,
    name: g.name,
    category_id: base.category_id,
    unit_price: 0,
    metadata: { field_key: g.fieldKey, widget: 'multi_part_picker' },
  })
  check(`${g.sku}: insert picker item`, insErr)

  const picker = await itemId(g.sku)
  const { error: partsErr } = await supabase.from('equipment_options').insert(
    g.parts.map((part_number, i) => ({
      item_id: picker.id,
      option_key: g.fieldKey,
      option_label: part_number,
      option_value: part_number,
      sort_order: i + 1,
    }))
  )
  check(`${g.sku}: insert part options`, partsErr)

  const { error: ruleErr } = await supabase.from('dependency_rules').insert({
    rule_name: g.ruleName,
    trigger_field: 'applicator_arches',
    trigger_value: g.triggerValue,
    action_type: 'show',
    target_field: g.fieldKey,
    target_value: null,
  })
  check(`${g.sku}: insert dependency rule`, ruleErr)

  console.log(`${g.name}: done (${g.parts.length} parts).`)
}

console.log('Migration 0015 applied successfully.')
