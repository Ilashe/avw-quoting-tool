// AVW Quoting Tool — Phase 12 batch fixes (2026-09-15 client edit list)
// Idempotent: every block deletes-before-inserting or updates by stable key, safe to re-run.
// Run with: node scripts/phase12-conveyor-steel-belt-and-batch-fixes.mjs
//
// Summary of changes (see PROJECT_STATUS.md / memory for full rationale):
//  1. Merge Stainless Steel (EQ-CONV-002) + Primered Steel (EQ-CONV-0021) independent Yes/No
//     toggles into one "Type of Steel" radio (mutually exclusive) on EQ-CONV-002.
//  2. Repurpose "Type of Conveyor" (EQ-CONV-001, Single/Double) into "Type of Belt"
//     (Standard/Hybrid) — feeds the belt part number's Config derivation.
//  3. Delete "Config" (EQ-CONV-002A2) — now derived in code from Type of Steel x Type of Belt.
//  4. Move "Belt Texture" (was EQ-BELT-004) into the Conveyor section as EQ-CONV-001A, directly
//     below Type of Belt.
//  5. Delete "Belt Configuration" (EQ-BELT-003) entirely — unused standalone field.
//  6. "Zero Octa" -> "Blank Octa" (EQ-FRIN-001 option label + EQ-FRIN-001A item name).
//  7. "Flight Color"/"Flight Size"/"Flight Spacing Details" -> "Tire Pusher Color"/"Tire Pusher
//     Size"/"Tire Pusher Spacing Details" (display names only, field_keys unchanged).
//  8. Flight Size "1\" & 2\" Alternating" auto-populate text corrected.
//  9. "Spinning Wheel Blaster" becomes an option under Wheel Blaster (EQ-HP-003); the old
//     standalone pending field (EQ-HP-003A) is removed.
// 10. "Color" (EQ-BLOW-003) -> "Housing Color".
// 11. Heated Dryers (EQ-BLOW-012) simplified to Yes/No; Yes reveals a "How Many Heated Dryers?"
//     1/2/3/4 radio (new EQ-BLOW-012A) which drives a derived read-only description field (new
//     EQ-BLOW-012B), same pattern as Tire Pusher Spacing Details.

import { readFileSync } from 'fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function step(label, fn) {
  process.stdout.write(`\n--- ${label} ---\n`)
  await fn()
}

async function getItemBySku(sku) {
  const { data, error } = await supabase.from('equipment_items').select('*').eq('sku', sku).single()
  if (error) throw error
  return data
}

async function replaceOptions(itemId, optionKey, rows) {
  const del = await supabase.from('equipment_options').delete().eq('item_id', itemId)
  if (del.error) throw del.error
  if (rows.length === 0) return
  const ins = await supabase
    .from('equipment_options')
    .insert(rows.map((r, i) => ({ item_id: itemId, option_key: optionKey, option_label: r[0], option_value: r[1], sort_order: i + 1 })))
  if (ins.error) throw ins.error
}

async function upsertItem({ sku, name, category_id, metadata }) {
  const { data: existing } = await supabase.from('equipment_items').select('id').eq('sku', sku).maybeSingle()
  if (existing) {
    const upd = await supabase.from('equipment_items').update({ name, category_id, metadata }).eq('id', existing.id)
    if (upd.error) throw upd.error
    return existing.id
  }
  const ins = await supabase.from('equipment_items').insert({ sku, name, category_id, metadata }).select('id').single()
  if (ins.error) throw ins.error
  return ins.data.id
}

async function deleteItemBySku(sku) {
  const { data: item } = await supabase.from('equipment_items').select('id').eq('sku', sku).maybeSingle()
  if (!item) return
  const delOpts = await supabase.from('equipment_options').delete().eq('item_id', item.id)
  if (delOpts.error) throw delOpts.error
  const delItem = await supabase.from('equipment_items').delete().eq('id', item.id)
  if (delItem.error) throw delItem.error
}

async function upsertDependencyRule(rule) {
  const { data: existing } = await supabase.from('dependency_rules').select('id').eq('rule_name', rule.rule_name).maybeSingle()
  if (existing) {
    const upd = await supabase.from('dependency_rules').update(rule).eq('id', existing.id)
    if (upd.error) throw upd.error
  } else {
    const ins = await supabase.from('dependency_rules').insert(rule)
    if (ins.error) throw ins.error
  }
}

const { data: cats, error: catErr } = await supabase.from('categories').select('*').in('section', ['conveyor', 'belt_specifications', 'blower_room', 'final_rinse', 'high_pressure_equipment'])
if (catErr) throw catErr
const conveyorCatId = cats.find((c) => c.section === 'conveyor').id
const beltCatId = cats.find((c) => c.section === 'belt_specifications').id
const blowerCatId = cats.find((c) => c.section === 'blower_room').id
const finalRinseCatId = cats.find((c) => c.section === 'final_rinse').id
const hpCatId = cats.find((c) => c.section === 'high_pressure_equipment').id

// ── 1. Type of Steel: merge Stainless/Primered Yes-No toggles into one radio ───────────────
await step('1. Type of Steel (merge EQ-CONV-002 + EQ-CONV-0021)', async () => {
  const item = await getItemBySku('EQ-CONV-002')
  const upd = await supabase
    .from('equipment_items')
    .update({ name: 'Type of Steel', metadata: { widget: 'radio', field_key: 'conveyor_steel_type' } })
    .eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptions(item.id, 'conveyor_steel_type', [
    ['Stainless Steel', 'stainless_steel'],
    ['Primered Steel', 'primered_steel'],
  ])
  await deleteItemBySku('EQ-CONV-0021')
  console.log('done')
})

// ── 2. Type of Belt (repurpose EQ-CONV-001, was Type of Conveyor / Single-Double) ──────────
await step('2. Type of Belt (repurpose EQ-CONV-001)', async () => {
  const item = await getItemBySku('EQ-CONV-001')
  const upd = await supabase
    .from('equipment_items')
    .update({ name: 'Type of Belt', metadata: { widget: 'radio', field_key: 'conveyor_belt_type' } })
    .eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptions(item.id, 'conveyor_belt_type', [
    ['Standard', 'standard'],
    ['Hybrid', 'hybrid'],
  ])
  console.log('done')
})

// ── 3. Remove Config (now derived from Type of Steel x Type of Belt in code) ───────────────
await step('3. Remove Config (EQ-CONV-002A2)', async () => {
  await deleteItemBySku('EQ-CONV-002A2')
  console.log('done')
})

// ── 4. Move Belt Texture into Conveyor section, below Type of Belt ─────────────────────────
await step('4. Belt Texture -> Conveyor section (EQ-CONV-001A)', async () => {
  const item = await getItemBySku('EQ-BELT-004')
  const upd = await supabase
    .from('equipment_items')
    .update({ sku: 'EQ-CONV-001A', category_id: conveyorCatId })
    .eq('id', item.id)
  if (upd.error) throw upd.error
  console.log('done')
})

// ── 5. Remove Belt Configuration entirely ───────────────────────────────────────────────────
await step('5. Remove Belt Configuration (EQ-BELT-003)', async () => {
  await deleteItemBySku('EQ-BELT-003')
  console.log('done')
})

// ── 6. Zero Octa -> Blank Octa ──────────────────────────────────────────────────────────────
await step('6. Zero Octa -> Blank Octa', async () => {
  const item = await getItemBySku('EQ-FRIN-001')
  const upd = await supabase
    .from('equipment_options')
    .update({ option_label: 'Blank Octa' })
    .eq('item_id', item.id)
    .eq('option_value', 'zero_octa')
  if (upd.error) throw upd.error
  const updName = await supabase
    .from('equipment_items')
    .update({ name: 'Applicator Arches - Blank Octa Selection' })
    .eq('sku', 'EQ-FRIN-001A')
  if (updName.error) throw updName.error
  console.log('done')
})

// ── 7. Tire Pusher renames (Flight Color / Flight Size / Flight Spacing Details) ───────────
await step('7. Tire Pusher renames', async () => {
  const rename = [
    ['EQ-BELT-006', 'Tire Pusher Color'],
    ['EQ-BELT-009', 'Tire Pusher Size'],
    ['EQ-BELT-010', 'Tire Pusher Spacing Details'],
  ]
  for (const [sku, name] of rename) {
    const upd = await supabase.from('equipment_items').update({ name }).eq('sku', sku)
    if (upd.error) throw upd.error
  }
  console.log('done')
})

// ── 8. Fix "1\" & 2\" Alternating" auto-populate text ───────────────────────────────────────
await step('8. Fix 1"&2" Alternating auto-populate text', async () => {
  await upsertDependencyRule({
    rule_name: 'eq_belt_010_flight_spacing_set_1in_2in_alternating',
    trigger_field: 'flight_size',
    trigger_value: '1in_2in_alternating',
    action_type: 'set_value',
    target_field: 'flight_spacing',
    target_value: '(2" is 24-25-26-25 pitch with 1" in between)',
  })
  console.log('done')
})

// ── 9. Spinning Wheel Blaster becomes an option under Wheel Blaster ────────────────────────
await step('9. Spinning Wheel Blaster -> option under Wheel Blaster', async () => {
  const item = await getItemBySku('EQ-HP-003')
  await replaceOptions(item.id, 'wheel_blaster', [
    ['Fixed Rocker Blaster', 'fixed_rocker_blaster'],
    ['Flipping Wheel Blaster', 'flipping_wheel_blaster'],
    ['Pivoting Wheel Blaster', 'pivoting_wheel_blaster'],
    ['Spinning Wheel Blaster', 'spinning_wheel_blaster'],
    ['None', 'none'],
  ])
  await deleteItemBySku('EQ-HP-003A')
  console.log('done')
})

// ── 10. Color -> Housing Color ──────────────────────────────────────────────────────────────
await step('10. Color -> Housing Color', async () => {
  const upd = await supabase.from('equipment_items').update({ name: 'Housing Color' }).eq('sku', 'EQ-BLOW-003')
  if (upd.error) throw upd.error
  console.log('done')
})

// ── 11. Heated Dryers: Yes/No -> How Many (1-4) -> derived description ─────────────────────
await step('11. Heated Dryers restructure', async () => {
  const item = await getItemBySku('EQ-BLOW-012')
  const upd = await supabase.from('equipment_items').update({ name: 'Heated Dryers' }).eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptions(item.id, 'heated_dryers', [
    ['Yes', 'yes'],
    ['No', 'no'],
  ])

  const countId = await upsertItem({
    sku: 'EQ-BLOW-012A',
    name: 'How Many Heated Dryers?',
    category_id: blowerCatId,
    metadata: { widget: 'radio', field_key: 'heated_dryers_count' },
  })
  await replaceOptions(countId, 'heated_dryers_count', [
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
  ])
  await upsertDependencyRule({
    rule_name: 'eq_blow_012a_heated_dryers_count_show',
    trigger_field: 'heated_dryers',
    trigger_value: 'yes',
    action_type: 'show',
    target_field: 'heated_dryers_count',
    target_value: null,
  })

  await upsertItem({
    sku: 'EQ-BLOW-012B',
    name: 'Heated Dryers Description',
    category_id: blowerCatId,
    metadata: { widget: 'text', readonly: true, field_key: 'heated_dryers_description' },
  })
  for (const n of [1, 2, 3, 4]) {
    await upsertDependencyRule({
      rule_name: `eq_blow_012b_heated_dryers_description_set_${n}`,
      trigger_field: 'heated_dryers_count',
      trigger_value: String(n),
      action_type: 'set_value',
      target_field: 'heated_dryers_description',
      target_value: `${n} – 900,000 BTU Natural Gas Heated Dryers`,
    })
  }
  console.log('done')
})

console.log('\nAll steps complete.')
