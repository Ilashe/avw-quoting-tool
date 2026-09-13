// AVW Quoting Tool — Phase 11 batch fixes (2026-09-13 client edit list: Conveyor / Belt Specs)
// Idempotent: every block deletes-before-inserting or updates by stable key, safe to re-run.
// Run with: node scripts/phase11-conveyor-belt-fixes.mjs

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
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

// Get category ids up front
const { data: cats, error: catErr } = await supabase.from('categories').select('*').in('section', ['conveyor', 'belt_specifications'])
if (catErr) throw catErr
const conveyorCatId = cats.find((c) => c.section === 'conveyor').id
const beltCatId = cats.find((c) => c.section === 'belt_specifications').id

// ── 1. Type of Conveyor: Single / Double ───────────────────────────────────────────────────
await step('1. Type of Conveyor options -> Single / Double', async () => {
  const item = await getItemBySku('EQ-CONV-001')
  await replaceOptions(item.id, 'conveyor', [
    ['Single', 'single'],
    ['Double', 'double'],
  ])
  console.log('done')
})

// ── 2. Conveyor Steel Type -> "Type of Steel", Stainless/Primered only ─────────────────────
await step('2. Type of Steel rename + options', async () => {
  const item = await getItemBySku('EQ-CONV-002')
  const upd = await supabase.from('equipment_items').update({ name: 'Type of Steel' }).eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptions(item.id, 'conveyor_steel_type', [
    ['Stainless Steel', 'stainless_steel'],
    ['Primered Steel', 'primered_steel'],
  ])
  console.log('done')
})

// ── 3. New fields: Drive, Horsepower, Voltage ──────────────────────────────────────────────
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

await step('3. Add Drive, Horsepower, Voltage', async () => {
  const driveId = await upsertItem({
    sku: 'EQ-CONV-002A',
    name: 'Drive',
    category_id: conveyorCatId,
    metadata: { widget: 'radio', field_key: 'conveyor_drive' },
  })
  await replaceOptions(driveId, 'conveyor_drive', [
    ['Single', 'single'],
    ['Dual', 'dual'],
  ])

  const hpId = await upsertItem({
    sku: 'EQ-CONV-002B',
    name: 'Horsepower',
    category_id: conveyorCatId,
    metadata: { widget: 'radio', field_key: 'conveyor_horsepower' },
  })
  await replaceOptions(hpId, 'conveyor_horsepower', [
    ['5 HP', '5hp'],
    ['10 HP', '10hp'],
    ['15 HP', '15hp'],
    ['20 HP', '20hp'],
    ['25 HP', '25hp'],
  ])

  const voltId = await upsertItem({
    sku: 'EQ-CONV-002C',
    name: 'Voltage',
    category_id: conveyorCatId,
    metadata: { widget: 'radio', field_key: 'conveyor_voltage' },
  })
  await replaceOptions(voltId, 'conveyor_voltage', [
    ['230/480V (US Standard)', '230_480v_us'],
    ['575V (Canada)', '575v_canada'],
    ['380V (Australia/Europe)', '380v_intl'],
  ])
  console.log('done')
})

// ── 4. Open/Closed Pit: "part no. TBD by Scott" ────────────────────────────────────────────
await step('4. Open/Closed Pit warning labels', async () => {
  for (const sku of ['EQ-CONV-004', 'EQ-CONV-005']) {
    const item = await getItemBySku(sku)
    const upd = await supabase
      .from('equipment_items')
      .update({ metadata: { ...item.metadata, warning_label: 'part no. TBD by Scott' } })
      .eq('id', item.id)
    if (upd.error) throw upd.error
  }
  console.log('done')
})

// ── 5. Pit Grate Color -> "Pit Grating Color", + Yellow/Gray, - None ───────────────────────
await step('5. Pit Grating Color rename + options', async () => {
  const item = await getItemBySku('EQ-CONV-006')
  const upd = await supabase.from('equipment_items').update({ name: 'Pit Grating Color' }).eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptions(item.id, 'pit_grate_color', [
    ['Black', 'black'],
    ['Blue', 'blue'],
    ['Red', 'red'],
    ['Yellow', 'yellow'],
    ['Gray', 'gray'],
  ])
  console.log('done')
})

// ── 6. Roller Correlator: gated RC4A picker instead of bare "Yes" ──────────────────────────
await step('6. Roller Correlator -> RC4A picker', async () => {
  const rcId = await upsertItem({
    sku: 'EQ-BELT-001A',
    name: 'Roller Correlator Selection',
    category_id: beltCatId,
    metadata: { widget: 'multi_part_picker', field_key: 'roller_correlator_parts' },
  })
  await replaceOptions(rcId, 'roller_correlator_parts', [['RC4A', 'RC4A']])

  const { data: existingRule } = await supabase
    .from('dependency_rules')
    .select('id')
    .eq('rule_name', 'eq_belt_001a_roller_correlator_parts_show')
    .maybeSingle()
  if (!existingRule) {
    const insRule = await supabase.from('dependency_rules').insert({
      rule_name: 'eq_belt_001a_roller_correlator_parts_show',
      trigger_field: 'roller_correlator',
      trigger_value: 'yes',
      action_type: 'show',
      target_field: 'roller_correlator_parts',
    })
    if (insRule.error) throw insRule.error
  }
  console.log('done')
})

// ── 7. Remove Guide Rollers entirely ───────────────────────────────────────────────────────
await step('7. Remove Guide Rollers', async () => {
  const item = await getItemBySku('EQ-BELT-002')
  const delOpts = await supabase.from('equipment_options').delete().eq('item_id', item.id)
  if (delOpts.error) throw delOpts.error
  const delItem = await supabase.from('equipment_items').delete().eq('id', item.id)
  if (delItem.error) throw delItem.error
  console.log('done')
})

// ── 8. Belt Type -> "Belt Configuration", TBD by Scott ─────────────────────────────────────
await step('8. Belt Configuration rename + warning label', async () => {
  const item = await getItemBySku('EQ-BELT-003')
  const upd = await supabase
    .from('equipment_items')
    .update({ name: 'Belt Configuration', metadata: { ...item.metadata, warning_label: 'TBD by Scott' } })
    .eq('id', item.id)
  if (upd.error) throw upd.error
  console.log('done')
})

// ── 9. Belt Texture: remove Flat, tag Diamond Plate ────────────────────────────────────────
await step('9. Belt Texture options', async () => {
  const item = await getItemBySku('EQ-BELT-004')
  await replaceOptions(item.id, 'belt_texture', [
    ['Diamond Plate — discuss autopopulate/pricing with sales', 'diamond_plate'],
  ])
  console.log('done')
})

// ── 10. Belt Color: remove No ───────────────────────────────────────────────────────────────
await step('10. Belt Color: remove No', async () => {
  const item = await getItemBySku('EQ-BELT-005')
  await replaceOptions(item.id, 'belt_color', [
    ['Black', 'black'],
    ['Blue', 'blue'],
    ['Red', 'red'],
  ])
  console.log('done')
})

// ── 11. Flight Color: add Yellow, remove No ────────────────────────────────────────────────
await step('11. Flight Color options', async () => {
  const item = await getItemBySku('EQ-BELT-006')
  await replaceOptions(item.id, 'flight_color', [
    ['Black', 'black'],
    ['Blue', 'blue'],
    ['Red', 'red'],
    ['Yellow', 'yellow'],
  ])
  console.log('done')
})

// ── 12. Safety Stripe Color: add Yellow, remove No, gate on Safety Stripe = Yes ────────────
await step('12. Safety Stripe Color options + gating', async () => {
  const item = await getItemBySku('EQ-BELT-008')
  await replaceOptions(item.id, 'safety_stripe_color', [
    ['Black', 'black'],
    ['Blue', 'blue'],
    ['Red', 'red'],
    ['Yellow', 'yellow'],
  ])
  const { data: existingRule } = await supabase
    .from('dependency_rules')
    .select('id')
    .eq('rule_name', 'eq_belt_008_safety_stripe_color_show')
    .maybeSingle()
  if (!existingRule) {
    const insRule = await supabase.from('dependency_rules').insert({
      rule_name: 'eq_belt_008_safety_stripe_color_show',
      trigger_field: 'safety_stripe',
      trigger_value: 'yes',
      action_type: 'show',
      target_field: 'safety_stripe_color',
    })
    if (insRule.error) throw insRule.error
  }
  console.log('done')
})

// ── 13. Flight Size: add "1\" & 2\" Alternating" before No ─────────────────────────────────
await step('13. Flight Size options', async () => {
  const item = await getItemBySku('EQ-BELT-009')
  await replaceOptions(item.id, 'flight_size', [
    ['1"', '1in'],
    ['1.25"', '1_25in'],
    ['1.5"', '1_5in'],
    ['2"', '2in'],
    ['1" & 2" Alternating', '1in_2in_alternating'],
    ['No', 'no'],
  ])
  console.log('done')
})

// ── 14. Flight Spacing -> "Flight Spacing Details", auto-populated, read-only ──────────────
await step('14. Flight Spacing Details auto-populate', async () => {
  const item = await getItemBySku('EQ-BELT-010')
  const upd = await supabase
    .from('equipment_items')
    .update({ name: 'Flight Spacing Details', metadata: { ...item.metadata, widget: 'text', readonly: true } })
    .eq('id', item.id)
  if (upd.error) throw upd.error

  // Old user-choice options are obsolete now that the field is derived, not chosen.
  const delOpts = await supabase.from('equipment_options').delete().eq('item_id', item.id)
  if (delOpts.error) throw delOpts.error

  // Obsolete exclude rules from when flight_spacing was a constrained user choice.
  const delExcludes = await supabase
    .from('dependency_rules')
    .delete()
    .eq('action_type', 'exclude')
    .eq('target_field', 'flight_spacing')
  if (delExcludes.error) throw delExcludes.error

  const setValueRules = [
    ['1in', '5-6-7-6 pitch'],
    ['1_25in', '8-9-8-9 pitch'],
    ['1_5in', '8-9-8-9 pitch'],
    ['2in', '13-13-13-13 pitch'],
    ['1in_2in_alternating', '24-25-26-25 pitch'],
  ]
  for (const [triggerValue, targetValue] of setValueRules) {
    const ruleName = `eq_belt_010_flight_spacing_set_${triggerValue}`
    const { data: existingRule } = await supabase.from('dependency_rules').select('id').eq('rule_name', ruleName).maybeSingle()
    if (existingRule) {
      const upd2 = await supabase.from('dependency_rules').update({ target_value: targetValue }).eq('id', existingRule.id)
      if (upd2.error) throw upd2.error
    } else {
      const ins = await supabase.from('dependency_rules').insert({
        rule_name: ruleName,
        trigger_field: 'flight_size',
        trigger_value: triggerValue,
        action_type: 'set_value',
        target_field: 'flight_spacing',
        target_value: targetValue,
      })
      if (ins.error) throw ins.error
    }
  }
  console.log('done')
})

console.log('\nAll steps complete.')
