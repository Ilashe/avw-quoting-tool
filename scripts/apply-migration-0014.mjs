// Applies migration 0014 directly via service-role client (same approach as 0012) instead of
// requiring the client to paste SQL into the Supabase SQL Editor.
// Mirrors supabase/migrations/0014_friction_final_rinse_pickers_empty_robot_arch.sql exactly.
// Safe to re-run (matches the migration's re-runnable cleanup-then-insert pattern).

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

// ── 1) Robot Arch: re-activate + empty its part list ───────────────────────

{
  const { error } = await supabase
    .from('equipment_items')
    .update({ is_active: true })
    .in('sku', ['EQ-HP-001', 'EQ-HP-001A'])
  check('reactivate EQ-HP-001/EQ-HP-001A', error)

  const picker = await itemId('EQ-HP-001A')
  const { error: delErr } = await supabase.from('equipment_options').delete().eq('item_id', picker.id)
  check('empty EQ-HP-001A options', delErr)
  console.log('Robot Arch: reactivated + part list emptied.')
}

// ── 2-6) Friction/Final Rinse pending → Yes/No + multi_part_picker pairs ───

const FIELDS = [
  {
    baseSku: 'EQ-FRIC-004',
    baseFieldKey: 'tire_equipment',
    pickerSku: 'EQ-FRIC-004A',
    pickerFieldKey: 'tire_equipment_parts',
    pickerName: 'Tire Equipment Selection',
    ruleName: 'eq_fric_004a_tire_equipment_parts_show',
    parts: ['TB2', 'TB2-EL', 'TB2-1120', 'TB2-1120-EL', 'TB2-NP', 'TB3', 'TB3-EL', 'TB3-1120', 'TB3-1120-EL', 'TB4', 'TB4-EL', 'TW2', 'TW2-EL', 'TW2-1655', 'TW2-EL-1655'],
  },
  {
    baseSku: 'EQ-FRIC-005',
    baseFieldKey: 'top_washers',
    pickerSku: 'EQ-FRIC-005A',
    pickerFieldKey: 'top_washers_parts',
    pickerName: 'Top Washers Selection',
    ruleName: 'eq_fric_005a_top_washers_parts_show',
    parts: ['TR4', 'TR4-EL', 'OT2-TR5', 'OT2-TR5-EL'],
  },
  {
    baseSku: 'EQ-FRIC-003',
    baseFieldKey: 'sidewashers',
    pickerSku: 'EQ-FRIC-003A',
    pickerFieldKey: 'sidewashers_parts',
    pickerName: 'Side Washers Selection',
    ruleName: 'eq_fric_003a_sidewashers_parts_show',
    parts: ['FM1W', 'CB0405-EL', 'CB0405', 'CB2-EL', 'CB2', 'RB1-EL-0122', 'RB1-0122', 'SW2-EL', 'SW2', 'FM1W-EL'],
  },
  {
    baseSku: 'EQ-FRIC-006',
    baseFieldKey: 'wrap_mitter_combos',
    pickerSku: 'EQ-FRIC-006A',
    pickerFieldKey: 'wrap_mitter_combos_parts',
    pickerName: 'Wrap Mitter Combos Selection',
    ruleName: 'eq_fric_006a_wrap_mitter_combos_parts_show',
    // 'OTC-MC2' from client's list confirmed a typo for 'OT2-MC2' (see migration file header note)
    parts: ['MC2', 'MC2-EL', 'MC2-R-0818', 'MC2-R-EL-0818', 'OT2-MC2', 'OT2-MC2-EL', 'OT2-MM5', 'OT2-MM5-EL', 'DM2-EL', 'DMM5', 'DMM5-EL', 'OT2-DM2', 'OT2-DM2-EL', 'MM5', 'MM5-EL', 'MM5-R-EL-0818', 'OT2-MM5-R-0818', 'OT2-MM5-R-EL-0818'],
  },
  {
    baseSku: 'EQ-FRIN-002',
    baseFieldKey: 'shower_rinse_manifolds',
    pickerSku: 'EQ-FRIN-002A',
    pickerFieldKey: 'shower_rinse_manifolds_parts',
    pickerName: 'Shower Rinse Manifolds Selection',
    ruleName: 'eq_frin_002a_shower_rinse_manifolds_parts_show',
    parts: ['AA5DA-1', 'AA5DC-30', 'AA5DB', 'SQHS1420050', 'FW12', 'HN1213', 'UB-SQ050X1500'],
  },
]

for (const f of FIELDS) {
  // cleanup
  const { error: ruleDelErr } = await supabase.from('dependency_rules').delete().eq('rule_name', f.ruleName)
  check(`${f.pickerSku}: delete rule`, ruleDelErr)

  const { error: pickerDelErr } = await supabase.from('equipment_items').delete().eq('sku', f.pickerSku)
  check(`${f.pickerSku}: delete existing picker item`, pickerDelErr)

  const { error: metaErr } = await supabase
    .from('equipment_items')
    .update({ metadata: { field_key: f.baseFieldKey, widget: 'radio' } })
    .eq('sku', f.baseSku)
  check(`${f.baseSku}: set metadata`, metaErr)

  const base = await itemId(f.baseSku)
  const { error: baseOptDelErr } = await supabase.from('equipment_options').delete().eq('item_id', base.id)
  check(`${f.baseSku}: clear options`, baseOptDelErr)

  const { error: yesNoErr } = await supabase.from('equipment_options').insert([
    { item_id: base.id, option_key: f.baseFieldKey, option_label: 'Yes', option_value: 'yes', sort_order: 1 },
    { item_id: base.id, option_key: f.baseFieldKey, option_label: 'No', option_value: 'no', sort_order: 2 },
  ])
  check(`${f.baseSku}: insert Yes/No options`, yesNoErr)

  const { error: pickerInsErr } = await supabase.from('equipment_items').insert({
    sku: f.pickerSku,
    name: f.pickerName,
    category_id: base.category_id,
    unit_price: 0,
    metadata: { field_key: f.pickerFieldKey, widget: 'multi_part_picker' },
  })
  check(`${f.pickerSku}: insert picker item`, pickerInsErr)

  const picker = await itemId(f.pickerSku)
  const { error: partsInsErr } = await supabase.from('equipment_options').insert(
    f.parts.map((part_number, i) => ({
      item_id: picker.id,
      option_key: f.pickerFieldKey,
      option_label: part_number,
      option_value: part_number,
      sort_order: i + 1,
    }))
  )
  check(`${f.pickerSku}: insert part options`, partsInsErr)

  const { error: ruleInsErr } = await supabase.from('dependency_rules').insert({
    rule_name: f.ruleName,
    trigger_field: f.baseFieldKey,
    trigger_value: 'yes',
    action_type: 'show',
    target_field: f.pickerFieldKey,
    target_value: null,
  })
  check(`${f.pickerSku}: insert dependency rule`, ruleInsErr)

  console.log(`${f.pickerName}: done (${f.parts.length} parts).`)
}

console.log('Migration 0014 applied successfully.')
