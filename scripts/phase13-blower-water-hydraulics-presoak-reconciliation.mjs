// AVW Quoting Tool — Phase 13 batch fixes (2026-09-23 client edit list)
// Idempotent: every block deletes-before-inserting or updates by stable key, safe to re-run.
// Run with: node scripts/phase13-blower-water-hydraulics-presoak-reconciliation.mjs
//
// All real part numbers/descriptions/prices cross-checked against Items (11).xlsx
// (C:\Users\HomePC\Downloads\Items (11).xlsx) — several part numbers in the client's pasted PDF
// text were mangled by PDF extraction (e.g. the Presoak "AA1-3" family is really "AA1X3", not a
// dash — the source was "×3"). This script uses the Excel-confirmed spellings throughout.
//
// Summary of changes:
//  1. Belt Texture auto-selects "Diamond Plate" once Type of Belt has any value.
//  2. Water Reclaim System, Spot Free Water Tank — real priced options.
//  3. Reverse Osmosis System, Air Compressor, Air Assist Panels, Heated Dryers, Shower Rinse
//     Manifolds, Mirror Rinse, Avalanche — "TBD-compare Josh sheet and quote" light tag.
//  4. Hydraulic Units -> multi_qty_picker (multi-select, independent qty per port/unit); old
//     "How many?" field removed (absorbed into per-option qty).
//  5. Water Solenoid 1/2"/3/4"/1" -> real priced `select` options (were bare select_range 1-7).
//  6. Glass Block Rinse Wall Ring, Blower Frames -> real priced radio (were pending).
//  7. Blower HP/Nozzle Orientation/Rotation/Housing Color/Number of Blowers real part-number
//     system; legacy type_of_blowers_black/blue/red removed.
//  8. Blower Arches real options; new Blower Crossbars field under it.
//  9. Miscellaneous Blower Items -> multi_qty_picker (was pending).
// 10. Drying Huggers -> Electric/Hydraulic Drive real options.
// 11. Presoak, CTA Type, Underbody Flush -> real priced options.

import { readFileSync } from 'fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(join(process.cwd(), '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const TAG = 'TBD-compare Josh sheet and quote'

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

// Same as replaceOptions but rows are [label, value, price_modifier].
async function replaceOptionsWithPrice(itemId, optionKey, rows) {
  const del = await supabase.from('equipment_options').delete().eq('item_id', itemId)
  if (del.error) throw del.error
  if (rows.length === 0) return
  const ins = await supabase.from('equipment_options').insert(
    rows.map((r, i) => ({
      item_id: itemId,
      option_key: optionKey,
      option_label: r[0],
      option_value: r[1],
      price_modifier: r[2],
      sort_order: i + 1,
    }))
  )
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

async function setWarningLabel(sku, text) {
  const item = await getItemBySku(sku)
  const upd = await supabase.from('equipment_items').update({ metadata: { ...item.metadata, warning_label: text } }).eq('id', item.id)
  if (upd.error) throw upd.error
}

const { data: cats, error: catErr } = await supabase
  .from('categories')
  .select('*')
  .in('section', ['blower_room', 'water', 'hydraulics', 'chemical_panels', 'presoak', 'final_rinse'])
if (catErr) throw catErr
const blowerCatId = cats.find((c) => c.section === 'blower_room').id

// ── 1. Belt Texture auto-select ─────────────────────────────────────────────────────────────
await step('1. Belt Texture auto-selects Diamond Plate', async () => {
  await upsertDependencyRule({
    rule_name: 'phase13_belt_texture_force_standard',
    trigger_field: 'conveyor_belt_type',
    trigger_value: 'standard',
    action_type: 'set_value',
    target_field: 'belt_texture',
    target_value: 'diamond_plate',
  })
  await upsertDependencyRule({
    rule_name: 'phase13_belt_texture_force_hybrid',
    trigger_field: 'conveyor_belt_type',
    trigger_value: 'hybrid',
    action_type: 'set_value',
    target_field: 'belt_texture',
    target_value: 'diamond_plate',
  })
  console.log('done')
})

// ── 2. Water Reclaim System ─────────────────────────────────────────────────────────────────
await step('2. Water Reclaim System', async () => {
  const item = await getItemBySku('BR-WAT-002')
  await replaceOptionsWithPrice(item.id, 'water_reclaim_system', [
    ['CYCLONIC RECLAIM SYSTEM, 100 GPM (ERS100) GEN 3 (SS FRAME)', 'SOB-RECLAIM-100GPM', 32580],
    ['CYCLONIC RECLAIM SYSTEM, 150 GPM (ERS150) GEN 3 (SS FRAME)', 'SOB-RECLAIM-150', 47522],
    ['No', 'no', 0],
  ])
  console.log('done')
})

// ── 3. Reverse Osmosis System (tag only) ────────────────────────────────────────────────────
await step('3. Reverse Osmosis System tag', async () => {
  await setWarningLabel('BR-WAT-003', TAG)
  console.log('done')
})

// ── 4. Spot Free Water Tank ──────────────────────────────────────────────────────────────────
await step('4. Spot Free Water Tank', async () => {
  const item = await getItemBySku('BR-WAT-005')
  await replaceOptionsWithPrice(item.id, 'spot_free_water_tank', [
    ['800 gallon UV rated water storage tank, 46" diameter x 118" tall w/ float assembly', 'PURCL-800-TNK', 2500],
    ['No', 'no', 0],
  ])
  console.log('done')
})

// ── 5. Hydraulics section ────────────────────────────────────────────────────────────────────
await step('5. Hydraulic Units -> multi_qty_picker', async () => {
  const item = await getItemBySku('BR-HYD-001')
  const upd = await supabase
    .from('equipment_items')
    .update({ metadata: { ...item.metadata, widget: 'multi_qty_picker' } })
    .eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptionsWithPrice(item.id, 'hydraulic_unit_type', [
    ['Power Unit (Hydraulic): 1-Port- 7-5 HP', 'HPU1', 3950],
    ['Power Unit (Hydraulic): 2-Port', 'HPU2', 5290],
    ['Power Unit (Hydraulic): 3-Port', 'HPU3', 5475],
    ['Power Unit (Hydraulic): 4-Port', 'HPU4', 7354],
    ['Power Unit (Hydraulic): 5-Port', 'HPU5', 9245],
    ['Power Unit (Hydraulic): 6-Port', 'HPU6', 11860],
    ['Power Unit (Hydraulic): 7-Port', 'HPU7', 13340],
    ['Conveyor Power Unit - Includes: Remote Pulse Kit (CPU2R)- 7.5HP', 'CPU3', 5313],
    ['Custom Conveyor Power Unit - Includes: Remote Pulse Kit (CPU2R)- 10HP', 'CPU3-10', 6113],
    ['None', 'none', 0],
  ])
  console.log('done')
})

await step('5b. Remove Hydraulic Units - How many? (absorbed into per-option qty)', async () => {
  await deleteItemBySku('BR-HYD-002')
  const del = await supabase.from('dependency_rules').delete().eq('rule_name', 'br_hyd_007_unit_qty_hide')
  if (del.error) throw del.error
  console.log('done')
})

await step('5c. Air Compressor / Air Assist Panels tags', async () => {
  await setWarningLabel('BR-HYD-003', TAG)
  await setWarningLabel('BR-CHEM-004', TAG)
  console.log('done')
})

// ── 6. Water Solenoids ────────────────────────────────────────────────────────────────────────
await step('6. Water Solenoids -> real priced select', async () => {
  const halfIn = await getItemBySku('BR-CHEM-008')
  await supabase.from('equipment_items').update({ metadata: { widget: 'select', field_key: 'water_solenoid_half_in' } }).eq('id', halfIn.id)
  await replaceOptionsWithPrice(halfIn.id, 'water_solenoid_half_in', [
    ['Panel (Water Control), With One 1/2" Solenoid Valve', 'P-1SL1-2', 271],
    ['Panel (Water Control), With two 1/2" Solenoids', 'P-2SL1-2', 422],
    ['Panel (Water Control), With three 1/2" Solenoids', 'P-3SL1-2', 583],
    ['Panel (Water Control), With four 1/2" Water Solenoids', 'P-4SL1-2', 742],
    ['Panel (Water Control), With five 1/2" Solenoids', 'P-5SL1-2', 894],
    ['Panel (Water Control), With Six 1/2" Solenoids', 'P-6SL1-2', 1052],
  ])

  const threeQuarterIn = await getItemBySku('BR-CHEM-009')
  await supabase.from('equipment_items').update({ metadata: { widget: 'select', field_key: 'water_solenoid_3_4_in' } }).eq('id', threeQuarterIn.id)
  await replaceOptionsWithPrice(threeQuarterIn.id, 'water_solenoid_3_4_in', [
    ['Panel (Water Control), With One 3/4" Solenoid Valve', 'P-1SL3-4', 439],
    ['Panel (Water Control), With two 3/4" Solenoids', 'P-2SL3-4', 744],
    ['Panel (Water Control), With three 3/4" Solenoids', 'P-3SL3-4', 1197],
    ['Panel (Water Control), With Four 3/4" Solenoids', 'P-4SL3-4', 1448],
    ['Panel (Water Control), With Five 3/4" Solenoids', 'P-5SL3-4', 1824],
    ['Panel (Water Control), With Six 3/4" Solenoids', 'P-6SL3-4', 2177],
  ])

  const oneIn = await getItemBySku('BR-CHEM-010')
  await supabase.from('equipment_items').update({ metadata: { widget: 'select', field_key: 'water_solenoid_1_in' } }).eq('id', oneIn.id)
  await replaceOptionsWithPrice(oneIn.id, 'water_solenoid_1_in', [
    ['Panel (Water Control), With One 1" Solenoid Valve', 'P-1SL1', 667],
    ['Panel (Water Control), with Two 1" Solenoid Valves', 'P-2SL1', 1048],
    ['Panel (Water Control), with Three 1" Solenoid Valves', 'P-3SL1', 1436],
  ])
  console.log('done')
})

// ── 7. Glass Block Rinse Wall Ring ───────────────────────────────────────────────────────────
await step('7. Glass Block Rinse Wall Ring -> real priced radio', async () => {
  const item = await getItemBySku('EQ-BLOW-001')
  const upd = await supabase.from('equipment_items').update({ metadata: { ...item.metadata, widget: 'radio' } }).eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptionsWithPrice(item.id, 'glass_block_rinse_wall_ring', [
    ['Glass Block Archway-Straight Sides, Arched Top', 'BWA1', 3372],
    ['No', 'no', 0],
  ])
  console.log('done')
})

// ── 8. Blower HP/Nozzle/Rotation/Housing Color/Number of Blowers ────────────────────────────
await step('8. Nozzle Orientation + Rotation fields; reorder Number of Blowers', async () => {
  const nozzleId = await upsertItem({
    sku: 'EQ-BLOW-001B',
    name: 'Nozzle Orientation',
    category_id: blowerCatId,
    metadata: { widget: 'radio', field_key: 'blower_nozzle_orientation' },
  })
  await replaceOptions(nozzleId, 'blower_nozzle_orientation', [
    ['Angled', 'angled'],
    ['Straight', 'straight'],
  ])

  const rotationId = await upsertItem({
    sku: 'EQ-BLOW-001C',
    name: 'Rotation',
    category_id: blowerCatId,
    metadata: { widget: 'radio', field_key: 'blower_rotation' },
  })
  await replaceOptions(rotationId, 'blower_rotation', [
    ['Clockwise', 'cw'],
    ['Counterclockwise', 'ccw'],
  ])

  // Move Number of Blowers (EQ-BLOW-002) to sort after Housing Color (EQ-BLOW-003). Guarded for
  // re-runs: once renamed, EQ-BLOW-002 no longer exists.
  const { data: numberOfBlowers } = await supabase.from('equipment_items').select('id').eq('sku', 'EQ-BLOW-002').maybeSingle()
  if (numberOfBlowers) {
    const upd = await supabase.from('equipment_items').update({ sku: 'EQ-BLOW-003A' }).eq('id', numberOfBlowers.id)
    if (upd.error) throw upd.error
  }

  console.log('done')
})

await step('8b. Remove legacy Type of Blowers (black/blue/red)', async () => {
  await deleteItemBySku('EQ-BLOW-004')
  await deleteItemBySku('EQ-BLOW-005')
  await deleteItemBySku('EQ-BLOW-007')
  const del = await supabase
    .from('dependency_rules')
    .delete()
    .in('rule_name', ['eq_blower_seed_type_show_black', 'eq_blower_seed_type_show_blue', 'eq_blower_seed_type_show_red'])
  if (del.error) throw del.error
  console.log('done')
})

// ── 9. Blower Arches + new Blower Crossbars ──────────────────────────────────────────────────
await step('9. Blower Arches real options', async () => {
  const item = await getItemBySku('EQ-BLOW-009')
  const upd = await supabase.from('equipment_items').update({ metadata: { ...item.metadata, widget: 'radio' } }).eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptionsWithPrice(item.id, 'blower_arches', [
    ['Blower Arch, Octa², SS', 'OT2-BL1A-C', 2474],
    ["Blower Arch, Octa², 13' Wide, SS", 'OT2-BL1A-C-13', 2644],
    ["Blower Arch - 14' Wide - Octa²", 'OT2-BL1A-C-14', 2820],
    ['No', 'no', 0],
  ])
  console.log('done')
})

await step('10. New Blower Crossbars field', async () => {
  const crossbarsId = await upsertItem({
    sku: 'EQ-BLOW-009A',
    name: 'Blower Crossbars',
    category_id: blowerCatId,
    metadata: { widget: 'radio', field_key: 'blower_crossbars' },
  })
  await replaceOptionsWithPrice(crossbarsId, 'blower_crossbars', [
    ["Blower Crossbar, Octa², 12'LG., with (4) Square U-bolt Fasteners 1/2\"", 'OT2-BL1CC-12', 1685],
    ["Blower Crossbar, Octa², 14'LG., with (4) Square U-Bolt Fasteners 1/2\"", 'OT2-BL1CC-14', 1971],
    ['No', 'no', 0],
  ])
  console.log('done')
})

await step('11. Blower Frames real options', async () => {
  const item = await getItemBySku('EQ-BLOW-010')
  const upd = await supabase
    .from('equipment_items')
    .update({ name: 'Blower Frames', metadata: { ...item.metadata, widget: 'radio' } })
    .eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptionsWithPrice(item.id, 'blower_frame', [
    ["Blower Arch, 10' x 12' Octa², 84\" Legs, Includes Two (2) Octa² Crossbars, Front and Back, SS", 'OT2-BL1C10X12', 10400],
    ["Blower Arch, 12' x 12' Octa², 84\" Legs, Includes Three (3) Octa² Crossbars, Front and Back, SS", 'OT2-BL1C12X12', 12140],
    ["Blower Arch, 16' x 12' Octa², 84\" Legs, Includes Four (4) Octa² Crossbars, Front and Back, SS", 'OT2-BL1C16X12', 13210],
    ['No', 'no', 0],
  ])
  console.log('done')
})

// ── 12. Miscellaneous Blower Items -> multi_qty_picker ───────────────────────────────────────
await step('12. Miscellaneous Blower Items -> multi_qty_picker', async () => {
  const item = await getItemBySku('EQ-BLOW-011')
  const upd = await supabase.from('equipment_items').update({ metadata: { ...item.metadata, widget: 'multi_qty_picker' } }).eq('id', item.id)
  if (upd.error) throw upd.error
  await replaceOptionsWithPrice(item.id, 'misc_blower_items', [
    [
      'Blower Pivoting Nozzle. Front to Back Pivot, for Plastic Blower Housing, SS (Air Control Panel required, not included)',
      'BL0522DB-NZ-PIV2396',
      815,
    ],
    [
      'Blower Pivoting Nozzle. Side to Side Pivot, for Plastic Blower Housing, SS (Air Control Panel required, not included)',
      'BL0522D-NZ-PIV2495',
      762,
    ],
    [
      'B.I.G. Gate, (Blower Intake Gate) for Blower Producer, Conserves Energy and Controls Instantly, Air Operated, SS (Air Control Panel Not Included)',
      'BL1DC-2678',
      1619,
    ],
  ])
  console.log('done')
})

// ── 13. Heated Dryers tag ─────────────────────────────────────────────────────────────────────
await step('13. Heated Dryers tag', async () => {
  await setWarningLabel('EQ-BLOW-012', TAG)
  console.log('done')
})

// ── 14. Drying Huggers ───────────────────────────────────────────────────────────────────────
await step('14. Drying Huggers real options', async () => {
  const item = await getItemBySku('EQ-BLOW-013')
  await replaceOptionsWithPrice(item.id, 'drying_huggers', [
    [
      'Mirror Wiper, Finishing Module Kit, Electric Drive, Attaches to 4 x 4 Posts, includes Arms, Arm Mounts, Motor Mounts, and U-bolts (Brushes not included)',
      'FM1W-EL',
      13972,
    ],
    [
      'Mirror Wiper, Finishing Module Set, Attaches to 4 x 4 Posts, includes Arms, Arm Mounts, Brush Shaft Assemblies, Fasteners, and Air Control Panel (Brushes not included)',
      'FM1W',
      9122,
    ],
    ['No', 'no', 0],
  ])
  console.log('done')
})

// ── 15. Final Rinse tags ─────────────────────────────────────────────────────────────────────
await step('15. Shower Rinse Manifolds / Mirror Rinse tags', async () => {
  await setWarningLabel('EQ-FRIN-002', TAG)
  await setWarningLabel('EQ-FRIN-003', TAG)
  console.log('done')
})

// ── 16. Presoak ──────────────────────────────────────────────────────────────────────────────
await step('16. Presoak real options', async () => {
  const item = await getItemBySku('EQ-PRESOAK-001')
  await replaceOptionsWithPrice(item.id, 'presoak', [
    ['Arch (Empty), Octa² Design', 'OT2-AA0', 2016],
    ['Arch (Applicator), Octa², Stainless Steel Arch & Manifolds', 'OT2-AA1', 2556],
    ['Dual Applicator Arch, Octa², Stainless Steel Arch & Manifolds', 'OT2-AA2', 4116],
    ['Arch System Octa² Applicator, Single Manifold With CTA and Entrance Windshield Spray, SS', 'OT2-AA1X3', 5064],
    [
      'Arch System Octa² Applicator, Single Manifolds with Continuous Sides Separated at the top (2-Piece) With CTA and Entrance/Exit Windshield Spray, SS',
      'OT2-AA1X3-0622',
      4765,
    ],
    ['Arch System Octa² Applicator, Dual Manifolds Each With CTA and Entrance/Exit Windshield Sprays, SS', 'OT2-AA2X3', 5064],
    [
      'Arch System Octa² Applicator, Dual Manifolds with Continous Sides Separated at the top (2-Piece) Each With CTA and Entrance/Exit Windshield Spray, SS',
      'OT2-AA2X3-0622',
      5175,
    ],
    [
      'Arch System Octa² Applicator, Triple Manifolds with Continuous Sides Separated at the top (2-Piece) With CTA and Entrance/Exit Windshield Spray, SS',
      'OT2-AA3X3-0622',
      5675,
    ],
  ])
  console.log('done')
})

// ── 17. Avalanche tag ────────────────────────────────────────────────────────────────────────
await step('17. Avalanche tag', async () => {
  await setWarningLabel('EQ-PRESOAK-002', TAG)
  console.log('done')
})

// ── 18. CTA Type ─────────────────────────────────────────────────────────────────────────────
await step('18. CTA Type real options', async () => {
  const item = await getItemBySku('EQ-PRESOAK-004')
  await replaceOptionsWithPrice(item.id, 'cta_type', [
    ['Set-Chemical Tire Applicator, SS Construction, PVDF Nozzles, Chemical Pump Panel, non-foaming', 'CTA1', 2256],
    ['Applicator (Chemical Tire): Set of two stands w/o chemical pump panel', 'CTA1A', 853],
    [
      'Set - Chemical Tire Applicator, Arch Mountable with soap foamer style, SS Construction, PVDF Nozzles, Chemical Pump Panel, Non-Foaming',
      'CTA3',
      2256,
    ],
  ])
  console.log('done')
})

// ── 19. Underbody Flush ──────────────────────────────────────────────────────────────────────
await step('19. Underbody Flush real options', async () => {
  const item = await getItemBySku('EQ-PRESOAK-005')
  await replaceOptionsWithPrice(item.id, 'underbody_flush', [
    ['H Shaped Under Carriage Wash Manifold SS with PVDF Nozzles (90A2CM10E80), 28" x 13-1/2"', 'UW1', 1784],
    ['Under Carriage Wash, Hexagon Shape, SS Construction, 90° elbows, PVDF Nozzles', 'UW2', 1764],
    ['No', 'no', 0],
  ])
  console.log('done')
})

console.log('\nPhase 13 applied successfully.')
