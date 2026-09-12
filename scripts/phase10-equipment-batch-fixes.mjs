// AVW Quoting Tool — Phase 10 batch fixes (2026-09-12 client edit list)
// Idempotent: every block deletes-before-inserting or updates by stable key, safe to re-run.
// Run with: node scripts/phase10-equipment-batch-fixes.mjs

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const ITEM_IDS = {
  sidewashers_parts: 'df106600-176c-470a-9c06-ce717ea6a140',
  tire_equipment_parts: '837041fc-f56b-431f-a06f-db66076995d7',
  top_washers_parts: '472434d3-f858-4dc6-a28c-2aaaa60ab9e7',
  wrap_mitter_combos_parts: 'a60997a6-a2fb-42a0-9cae-b27c8ec5deee',
  wrap_parts: '34a897b7-a240-4ae7-9d0b-f94f801637e9',
  wrap_sidewasher_combos_parts: '62cacabd-4dc2-4456-abb2-071dc67c9dff',
}
const FRICTION_EQUIPMENT_CATEGORY_ID = 'ecf150cb-53ac-4e28-81ad-74e6ba73af0f'

async function step(label, fn) {
  process.stdout.write(`\n--- ${label} ---\n`)
  await fn()
}

// ── 4. Move FM1W / FM1W-EL: Side Washers -> Blower Room Misc Blower Items ──────────────────
await step('4. FM1W/FM1W-EL: Side Washers -> Misc Blower Items', async () => {
  const del = await supabase
    .from('equipment_options')
    .delete()
    .eq('item_id', ITEM_IDS.sidewashers_parts)
    .in('option_value', ['FM1W', 'FM1W-EL'])
  if (del.error) throw del.error

  const { data: blowerItem, error: blowerErr } = await supabase
    .from('equipment_items')
    .select('id, metadata')
    .eq('sku', 'EQ-BLOW-011')
    .single()
  if (blowerErr) throw blowerErr

  const upd = await supabase
    .from('equipment_items')
    .update({ metadata: { ...blowerItem.metadata, widget: 'multi_part_picker' } })
    .eq('id', blowerItem.id)
  if (upd.error) throw upd.error

  const ins = await supabase.from('equipment_options').insert([
    { item_id: blowerItem.id, option_key: 'misc_blower_items', option_label: 'FM1W', option_value: 'FM1W', sort_order: 1 },
    { item_id: blowerItem.id, option_key: 'misc_blower_items', option_label: 'FM1W-EL', option_value: 'FM1W-EL', sort_order: 2 },
  ])
  if (ins.error) throw ins.error
  console.log('done')
})

// ── 5. Tire Equipment: "Do you want brushes?" stub with red warning label ─────────────────
await step('5. Tire Equipment brushes stub question', async () => {
  const { data: existing } = await supabase.from('equipment_items').select('id').eq('sku', 'EQ-FRIC-004B').maybeSingle()
  let itemId = existing?.id

  if (!itemId) {
    const ins = await supabase
      .from('equipment_items')
      .insert({
        sku: 'EQ-FRIC-004B',
        name: 'Do you want brushes?',
        category_id: FRICTION_EQUIPMENT_CATEGORY_ID,
        metadata: {
          field_key: 'tire_equipment_brushes',
          widget: 'radio',
          warning_label: 'needs to add tire equipment',
        },
      })
      .select('id')
      .single()
    if (ins.error) throw ins.error
    itemId = ins.data.id
  }

  const delOpts = await supabase.from('equipment_options').delete().eq('item_id', itemId)
  if (delOpts.error) throw delOpts.error
  const insOpts = await supabase.from('equipment_options').insert([
    { item_id: itemId, option_key: 'tire_equipment_brushes', option_label: 'Yes', option_value: 'yes', sort_order: 1 },
    { item_id: itemId, option_key: 'tire_equipment_brushes', option_label: 'No', option_value: 'no', sort_order: 2 },
  ])
  if (insOpts.error) throw insOpts.error

  const { data: existingRule } = await supabase
    .from('dependency_rules')
    .select('id')
    .eq('rule_name', 'eq_fric_004b_tire_equipment_brushes_show')
    .maybeSingle()
  if (!existingRule) {
    const insRule = await supabase.from('dependency_rules').insert({
      rule_name: 'eq_fric_004b_tire_equipment_brushes_show',
      trigger_field: 'tire_equipment',
      trigger_value: 'yes',
      action_type: 'show',
      target_field: 'tire_equipment_brushes',
    })
    if (insRule.error) throw insRule.error
  }
  console.log('done')
})

// ── 6. Tire Equipment: remove 9 SKUs ───────────────────────────────────────────────────────
await step('6. Tire Equipment: remove 9 SKUs', async () => {
  const toRemove = [
    'TB2-1120', 'TB2-1120-EL', 'TB2-NP',
    'TB3-1120', 'TB3-1120-EL',
    'TB4', 'TB4-EL',
    'TW2-1655', 'TW2-EL-1655',
  ]
  const del = await supabase
    .from('equipment_options')
    .delete()
    .eq('item_id', ITEM_IDS.tire_equipment_parts)
    .in('option_value', toRemove)
  if (del.error) throw del.error
  console.log('done')
})

// ── 8. Top Washers: drop the stray Cloth "Blue" row (leaves only Grey) ────────────────────
await step('8. Top Washers: remove Cloth Blue bundle rows', async () => {
  const triggers = ['TR4', 'TR4-EL', 'OT2-TR5', 'OT2-TR5-EL', 'TR1105-0325', 'TR1105-EL-0325']
  const del = await supabase
    .from('part_bundle_rules')
    .delete()
    .in('trigger_part_number', triggers)
    .eq('required_part_number', 'TR5HA-DRYSOFT-CL-BL')
  if (del.error) throw del.error
  console.log('done')
})

// ── 9. Top Washers -> Mitter: relocate OT2-MC2-R-EL-0818 and MC2-0516 ─────────────────────
await step('9. Relocate OT2-MC2-R-EL-0818 and MC2-0516 to Mitter', async () => {
  const delOpts = await supabase
    .from('equipment_options')
    .delete()
    .eq('item_id', ITEM_IDS.top_washers_parts)
    .in('option_value', ['OT2-MC2-R-EL-0818', 'MC2-0516'])
  if (delOpts.error) throw delOpts.error

  // OT2-MC2-R-EL-0818 is now unreferenced anywhere (Mitter already has the equivalent
  // "MC2-R-EL-0818" trigger under its own naming) — its bundle rules are now orphaned.
  const delRules = await supabase.from('part_bundle_rules').delete().eq('trigger_part_number', 'OT2-MC2-R-EL-0818')
  if (delRules.error) throw delRules.error

  const { data: existingOpt } = await supabase
    .from('equipment_options')
    .select('id')
    .eq('item_id', ITEM_IDS.wrap_mitter_combos_parts)
    .eq('option_value', 'MC2-0516')
    .maybeSingle()
  if (!existingOpt) {
    const ins = await supabase.from('equipment_options').insert({
      item_id: ITEM_IDS.wrap_mitter_combos_parts,
      option_key: 'wrap_mitter_combos_parts',
      option_label: 'MC2-0516',
      option_value: 'MC2-0516',
      sort_order: 19,
    })
    if (ins.error) throw ins.error
  }
  // MC2-0516's existing part_bundle_rules (Mitter-shaped already) are left in place — step 10
  // flips allow_two_color_split on them.
  console.log('done')
})

// ── 10. Mitter: turn on the one-colour/two-colour split ───────────────────────────────────
await step('10. Mitter: enable allow_two_color_split', async () => {
  const triggers = [
    'MC2', 'MC2-EL', 'MC2-R-0818', 'MC2-R-EL-0818', 'OT2-MC2', 'OT2-MC2-EL',
    'MM5', 'MM5-EL', 'MM5-R-EL-0818', 'OT2-MM5', 'OT2-MM5-EL', 'OT2-MM5-R-0818', 'OT2-MM5-R-EL-0818',
    'MC2-0516',
  ]
  const upd = await supabase
    .from('part_bundle_rules')
    .update({ allow_two_color_split: true })
    .in('trigger_part_number', triggers)
    .not('choice_group', 'is', null)
  if (upd.error) throw upd.error
  console.log('done')
})

// ── 11. Wrap: add WA4 / WA4-EL (mirrors OT2-WA4's 19-row bundle, qty 2, component null) ───
function wa4BundleRows(trigger) {
  const rows = [
    [null, null, 'WA1M-72-510-5220-CORE', null, 1],
    ['Wrap [CLOTH]', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 'Cloth', 2],
    ['Wrap [CLOTH]', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 'Cloth', 3],
    ['Wrap [CLOTH]', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 'Cloth', 4],
    ['Wrap [CLOTH]', 'Blue Top / Black Bottom', 'WA1M-00-510-5220-SS-CL-BK-BL', 'Cloth', 5],
    ['Wrap [CLOTH]', 'Red Top / Black Bottom', 'WA1M-00-510-5220-SS-CL-RD-BK', 'Cloth', 6],
    ['Wrap [CLOTH]', 'Blue Top / Red Bottom', 'Part Number Needs Created', 'Cloth', 7],
    ['Wrap [CLOTH]', 'Black + Blue Alternating', 'Part Number Needs Created', 'Cloth', 8],
    ['Wrap [CLOTH]', 'Black + Red Alternating', 'Part Number Needs Created', 'Cloth', 9],
    ['Wrap [CLOTH]', 'Blue + Red Alternating', 'Part Number Needs Created', 'Cloth', 10],
    ['Wrap [FOAM]', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 'Foam', 11],
    ['Wrap [FOAM]', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 'Foam', 12],
    ['Wrap [FOAM]', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 'Foam', 13],
    ['Wrap [FOAM]', 'Blue Top / Black Bottom', 'WA1M-00-510-5220-SS-NG-BL-BK', 'Foam', 14],
    ['Wrap [FOAM]', 'Red Top / Black Bottom', 'WA1M-00-510-5220-SS-NG-RD-BK', 'Foam', 15],
    ['Wrap [FOAM]', 'Black + Blue Alternating', 'WA1M-00-510-5220-SS-NG-BK-BL', 'Foam', 16],
    ['Wrap [FOAM]', 'Blue + Red Alternating', 'WA1M-00-510-5220-SS-NG-BLRD', 'Foam', 17],
    ['Wrap [FOAM]', 'Black + Red Alternating', 'Part Number Needs Created', 'Foam', 18],
    ['Wrap [FOAM]', 'Blue Top / Red Bottom', 'Part Number Needs Created', 'Foam', 19],
  ]
  return rows.map(([choice_group, choice_label, required_part_number, choice_subgroup, sort_order]) => ({
    trigger_part_number: trigger,
    choice_group,
    choice_label,
    required_part_number,
    quantity: 2,
    sort_order,
    choice_subgroup,
    component: null,
    allow_two_color_split: false,
  }))
}

await step('11. Wrap: add WA4 / WA4-EL', async () => {
  const { data: existingOpts } = await supabase
    .from('equipment_options')
    .select('option_value')
    .eq('item_id', ITEM_IDS.wrap_parts)
    .in('option_value', ['WA4', 'WA4-EL'])
  const have = new Set((existingOpts ?? []).map((r) => r.option_value))
  const toInsert = []
  if (!have.has('WA4')) toInsert.push({ item_id: ITEM_IDS.wrap_parts, option_key: 'wrap_parts', option_label: 'WA4', option_value: 'WA4', sort_order: 5 })
  if (!have.has('WA4-EL')) toInsert.push({ item_id: ITEM_IDS.wrap_parts, option_key: 'wrap_parts', option_label: 'WA4-EL', option_value: 'WA4-EL', sort_order: 6 })
  if (toInsert.length) {
    const ins = await supabase.from('equipment_options').insert(toInsert)
    if (ins.error) throw ins.error
  }

  for (const trigger of ['WA4', 'WA4-EL']) {
    const del = await supabase.from('part_bundle_rules').delete().eq('trigger_part_number', trigger)
    if (del.error) throw del.error
    const ins = await supabase.from('part_bundle_rules').insert(wa4BundleRows(trigger))
    if (ins.error) throw ins.error
  }
  console.log('done')
})

// ── 12. Wrap Sidewasher Combos: add OT2-2WAMC2-EL (mirrors OT2-2WAMC2's 25-row bundle) ────
function wamc2ElBundleRows(trigger) {
  const rows = [
    [null, null, 'WA1M-72-510-5220-CORE', null, null, 4, 1, false],
    ['Wrap [CLOTH]', 'Black', 'WA1M-00-510-5220-SS-CL-BK', 'Cloth', 'Wrap', 4, 2, false],
    ['Wrap [CLOTH]', 'Blue', 'WA1M-00-510-5220-SS-CL-BL', 'Cloth', 'Wrap', 4, 3, false],
    ['Wrap [CLOTH]', 'Red', 'WA1M-00-510-5220-SS-CL-RD', 'Cloth', 'Wrap', 4, 4, false],
    ['Wrap [CLOTH]', 'Blue Top / Black Bottom', 'WA1M-00-510-5220-SS-CL-BK-BL', 'Cloth', 'Wrap', 4, 5, false],
    ['Wrap [CLOTH]', 'Red Top / Black Bottom', 'WA1M-00-510-5220-SS-CL-RD-BK', 'Cloth', 'Wrap', 4, 6, false],
    ['Wrap [CLOTH]', 'Blue Top / Red Bottom', 'Part Number Needs Created', 'Cloth', 'Wrap', 4, 7, false],
    ['Wrap [CLOTH]', 'Black + Blue Alternating', 'Part Number Needs Created', 'Cloth', 'Wrap', 4, 8, false],
    ['Wrap [CLOTH]', 'Black + Red Alternating', 'Part Number Needs Created', 'Cloth', 'Wrap', 4, 9, false],
    ['Wrap [CLOTH]', 'Blue + Red Alternating', 'Part Number Needs Created', 'Cloth', 'Wrap', 4, 10, false],
    ['Wrap [FOAM]', 'Black', 'WA1M-00-510-5220-SS-NG-BK', 'Foam', 'Wrap', 4, 11, false],
    ['Wrap [FOAM]', 'Blue', 'WA1M-00-510-5220-SS-NG-BL', 'Foam', 'Wrap', 4, 12, false],
    ['Wrap [FOAM]', 'Red', 'WA1M-00-510-5220-SS-NG-RD', 'Foam', 'Wrap', 4, 13, false],
    ['Wrap [FOAM]', 'Blue Top / Black Bottom', 'WA1M-00-510-5220-SS-NG-BL-BK', 'Foam', 'Wrap', 4, 14, false],
    ['Wrap [FOAM]', 'Red Top / Black Bottom', 'WA1M-00-510-5220-SS-NG-RD-BK', 'Foam', 'Wrap', 4, 15, false],
    ['Wrap [FOAM]', 'Black + Blue Alternating', 'WA1M-00-510-5220-SS-NG-BK-BL', 'Foam', 'Wrap', 4, 16, false],
    ['Wrap [FOAM]', 'Blue + Red Alternating', 'WA1M-00-510-5220-SS-NG-BLRD', 'Foam', 'Wrap', 4, 17, false],
    ['Wrap [FOAM]', 'Black + Red Alternating', 'Part Number Needs Created', 'Foam', 'Wrap', 4, 18, false],
    ['Wrap [FOAM]', 'Blue Top / Red Bottom', 'Part Number Needs Created', 'Foam', 'Wrap', 4, 19, false],
    ['Mitter [CLOTH]', 'Black', 'MC1E-12W79L-S-CL-AVW-BK', 'Cloth', 'Mitter (Regular)', 42, 20, true],
    ['Mitter [CLOTH]', 'Blue', 'MC1E-12W79L-S-CL-AVW-BL', 'Cloth', 'Mitter (Regular)', 42, 21, true],
    ['Mitter [CLOTH]', 'Red', 'MC1E-12W79L-S-CL-AVW-RD', 'Cloth', 'Mitter (Regular)', 42, 22, true],
    ['Mitter [MICROFIBER]', 'Black', 'MC1E-04W79L-S-MFBR-BLK', 'Microfiber', 'Mitter (Regular)', 63, 23, true],
    ['Mitter [MICROFIBER]', 'Blue', 'MC1E-04W79L-S-MFBR-BLUE', 'Microfiber', 'Mitter (Regular)', 63, 24, true],
    ['Mitter [MICROFIBER]', 'Red', 'MC1E-04W79L-S-MFBR-RED', 'Microfiber', 'Mitter (Regular)', 63, 25, true],
  ]
  return rows.map(([choice_group, choice_label, required_part_number, choice_subgroup, component, quantity, sort_order, allow_two_color_split]) => ({
    trigger_part_number: trigger,
    choice_group,
    choice_label,
    required_part_number,
    quantity,
    sort_order,
    choice_subgroup,
    component,
    allow_two_color_split,
  }))
}

await step('12. Wrap Sidewasher Combos: add OT2-2WAMC2-EL', async () => {
  const { data: existingOpt } = await supabase
    .from('equipment_options')
    .select('id')
    .eq('item_id', ITEM_IDS.wrap_sidewasher_combos_parts)
    .eq('option_value', 'OT2-2WAMC2-EL')
    .maybeSingle()
  if (!existingOpt) {
    const ins = await supabase.from('equipment_options').insert({
      item_id: ITEM_IDS.wrap_sidewasher_combos_parts,
      option_key: 'wrap_sidewasher_combos_parts',
      option_label: 'OT2-2WAMC2-EL',
      option_value: 'OT2-2WAMC2-EL',
      sort_order: 12,
    })
    if (ins.error) throw ins.error
  }

  const del = await supabase.from('part_bundle_rules').delete().eq('trigger_part_number', 'OT2-2WAMC2-EL')
  if (del.error) throw del.error
  const ins = await supabase.from('part_bundle_rules').insert(wamc2ElBundleRows('OT2-2WAMC2-EL'))
  if (ins.error) throw ins.error
  console.log('done')
})

// ── 13. Conveyor: rename item, remove Over Under / None ───────────────────────────────────
await step('13. Conveyor: rename + remove Over Under / None', async () => {
  const upd = await supabase.from('equipment_items').update({ name: 'Type of Conveyor' }).eq('sku', 'EQ-CONV-001')
  if (upd.error) throw upd.error
  const del = await supabase
    .from('equipment_options')
    .delete()
    .eq('item_id', ITEM_IDS.conveyor ?? '251556d6-ef8d-4a59-80be-1c68d5dcfa7c')
    .in('option_value', ['over_under', 'none'])
  if (del.error) throw del.error
  console.log('done')
})

console.log('\nAll steps complete.')
