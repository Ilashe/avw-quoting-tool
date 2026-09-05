// Phases 3-7 of the Equipment Options reconciliation (see plan history): rebuilds
// part_bundle_rules for every Contour standalone SKU, every combo family, Rocker (new), and
// Side Washer standalone (new) — data transcribed directly from master_prompt_full_rebuild.md's
// Contour/Wrap/Side Washer/Rocker/Mitter Lookup sheets and Equipment Requirements table.
//
// Requires migration 0067 (part_bundle_rules.component / .allow_two_color_split columns) to
// already be applied. Idempotent: each trigger's existing rows are deleted before the correct
// full set is re-inserted.
//
// Does NOT touch: standalone Mitter triggers (OT2-MC2 family, OT2-MM5 family — already correct,
// Phase 8 only adds allow_two_color_split there), Top Brush, Tire, or anything unrelated.

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

const NEEDS_CREATED = 'Part Number Needs Created'

// ── Reusable building blocks (transcribed from the master spec's Lookup sheets) ────────────

function contourCoverRows(zonePrefix, avwOrKaady) {
  const parts =
    avwOrKaady === 'AVW'
      ? { lowerBase: 'CB0405AMA-23-13-S', upperBase: 'CB0405AMA-50-13-S' }
      : { lowerBase: 'CB1AMA-23-13-S', upperBase: 'CB1AMA-50-13-S' }
  const base = zonePrefix === 'Lower' ? parts.lowerBase : parts.upperBase
  const rows = []
  for (const [material, code] of [['Cloth', 'CL'], ['Foam', 'NG']]) {
    for (const [label, suffix] of [['Black', 'BK'], ['Blue', 'BL'], ['Red', 'RD']]) {
      rows.push({
        choice_group: `${zonePrefix} Contour [${material.toUpperCase()}]`,
        choice_subgroup: material,
        choice_label: label,
        required_part_number: `${base}-${code}-${suffix}`,
        quantity: 2,
      })
    }
  }
  return rows
}

function wrapRows(quantity) {
  const cloth = [
    ['Black', 'WA1M-00-510-5220-SS-CL-BK'],
    ['Blue', 'WA1M-00-510-5220-SS-CL-BL'],
    ['Red', 'WA1M-00-510-5220-SS-CL-RD'],
    ['Blue Top / Black Bottom', 'WA1M-00-510-5220-SS-CL-BK-BL'],
    ['Red Top / Black Bottom', 'WA1M-00-510-5220-SS-CL-RD-BK'],
    ['Blue Top / Red Bottom', NEEDS_CREATED],
    ['Black + Blue Alternating', NEEDS_CREATED],
    ['Black + Red Alternating', NEEDS_CREATED],
    ['Blue + Red Alternating', NEEDS_CREATED],
  ]
  const foam = [
    ['Black', 'WA1M-00-510-5220-SS-NG-BK'],
    ['Blue', 'WA1M-00-510-5220-SS-NG-BL'],
    ['Red', 'WA1M-00-510-5220-SS-NG-RD'],
    ['Blue Top / Black Bottom', 'WA1M-00-510-5220-SS-NG-BL-BK'],
    ['Red Top / Black Bottom', 'WA1M-00-510-5220-SS-NG-RD-BK'],
    ['Black + Blue Alternating', 'WA1M-00-510-5220-SS-NG-BK-BL'],
    ['Blue + Red Alternating', 'WA1M-00-510-5220-SS-NG-BLRD'],
    ['Black + Red Alternating', NEEDS_CREATED],
    ['Blue Top / Red Bottom', NEEDS_CREATED],
  ]
  const rows = []
  for (const [material, colors] of [['Cloth', cloth], ['Foam', foam]]) {
    for (const [label, partNumber] of colors) {
      rows.push({
        choice_group: `Wrap [${material.toUpperCase()}]`,
        choice_subgroup: material,
        choice_label: label,
        required_part_number: partNumber,
        quantity,
      })
    }
  }
  return rows
}

function sideWasherRows() {
  const cloth = [
    ['Black', 'SW1M-00-510-5220-SS-CL-BK'],
    ['Blue', 'SW1M-00-510-5220-SS-CL-BL'],
    ['Red', 'SW1M-00-510-5220-SS-CL-RD'],
    ['Blue Top / Black Bottom', NEEDS_CREATED],
    ['Red Top / Black Bottom', NEEDS_CREATED],
    ['Blue Top / Red Bottom', NEEDS_CREATED],
    ['Black + Blue Alternating', NEEDS_CREATED],
    ['Black + Red Alternating', NEEDS_CREATED],
    ['Blue + Red Alternating', NEEDS_CREATED],
  ]
  const foam = [
    ['Black', 'SW1M-00-510-5220-SS-NG-BK'],
    ['Blue', 'SW1M-00-510-5220-SS-NG-BL'],
    ['Red', NEEDS_CREATED],
    ['Blue Top / Black Bottom', NEEDS_CREATED],
    ['Red Top / Black Bottom', 'SW1M-00-510-5220-SS-NG-RDBK'],
    ['Black + Blue Alternating', 'SW1M-00-510-5220-SS-NG-BKBL'],
    ['Blue + Red Alternating', 'SW1M-00-510-5220-SS-BLRD'],
    ['Black + Red Alternating', NEEDS_CREATED],
  ]
  const rows = []
  for (const [material, colors] of [['Cloth', cloth], ['Foam', foam]]) {
    for (const [label, partNumber] of colors) {
      rows.push({
        choice_group: `Side Washer [${material.toUpperCase()}]`,
        choice_subgroup: material,
        choice_label: label,
        required_part_number: partNumber,
        quantity: 2,
      })
    }
  }
  return rows
}

function mitterRows(size /* 'regular' | 'mini' */) {
  const qty = { regular: { Cloth: 42, Foam: 63 }, mini: { Cloth: 28, Foam: 42 } }[size]
  const parts = {
    Cloth: [
      ['Black', 'MC1E-12W79L-S-CL-AVW-BK'],
      ['Blue', 'MC1E-12W79L-S-CL-AVW-BL'],
      ['Red', 'MC1E-12W79L-S-CL-AVW-RD'],
    ],
    Foam: [
      ['Black', 'MC1E-04W79L-S-MFBR-BLK'],
      ['Blue', 'MC1E-04W79L-S-MFBR-BLUE'],
      ['Red', 'MC1E-04W79L-S-MFBR-RED'],
    ],
  }
  const rows = []
  for (const material of ['Cloth', 'Foam']) {
    for (const [label, partNumber] of parts[material]) {
      rows.push({
        choice_group: `Mitter [${material.toUpperCase()}]`,
        choice_subgroup: material,
        choice_label: label,
        required_part_number: partNumber,
        quantity: qty[material],
      })
    }
  }
  return rows
}

// Rocker: single component (component=null), reuses the pre-existing EXCLUSIVE
// family(=height):material colon convention — no top-level always-added core, since the core
// part number itself depends on the chosen height. Each (height, material) choice_label row
// therefore carries BOTH the height-specific core AND the cover together (same mechanism
// CB0405 already uses to add two required parts from one colour pick).
function rockerRows() {
  const heights = [
    ['23"', 'RB1AMC-23-13', {
      Cloth: [['Black', 'RB1AMA-23-13-S-CL-BK'], ['Blue', 'RB1AMA-23-13-S-CL-BL'], ['Red', 'RB1AMA-23-13-S-CL-RD']],
      Foam: [['Black', 'RB1AMA-23-13-S-NG-BK'], ['Blue', 'RB1AMA-23-13-S-NG-BL'], ['Red', 'RB1AMA-23-13-S-NG-RD']],
    }],
    ['28"', 'RB1AMC-28-13', {
      Cloth: [['Black', 'RB1AMA-28-13-S-CL-BK'], ['Blue', 'RB1AMA-28-13-S-CL-BL'], ['Red', 'RB1AMA-28-13-S-CL-RD']],
      Foam: [['Black', 'RB1AMA-28-13-S-NG-BK'], ['Blue', 'RB1AMA-28-13-S-NG-BL'], ['Red', 'RB1AMA-28-13-S-NG-RD']],
    }],
    ['41"', 'RB1AMC-41-13', {
      Cloth: [['Black', 'RB1AMA-41-13-S-CL-BK'], ['Blue', 'RB1AMA-41-13-S-CL-BL'], ['Red', NEEDS_CREATED]],
      Foam: [['Black', NEEDS_CREATED], ['Blue', NEEDS_CREATED], ['Red', NEEDS_CREATED]],
    }],
  ]
  const rows = []
  for (const [height, core, materials] of heights) {
    for (const material of ['Cloth', 'Foam']) {
      const choice_group = `Rocker ${height} [${material.toUpperCase()}]`
      const choice_subgroup = `${height}:${material}`
      for (const [label, coverPart] of materials[material]) {
        rows.push({ choice_group, choice_subgroup, choice_label: label, required_part_number: core, quantity: 2 })
        rows.push({ choice_group, choice_subgroup, choice_label: label, required_part_number: coverPart, quantity: 2 })
      }
    }
  }
  return rows
}

// ── Applier ──────────────────────────────────────────────────────────────────────────────

function check(label, error) {
  if (error) {
    console.error(`FAILED at ${label}:`, error.message)
    process.exit(1)
  }
}

// coreRows: always-added rows (choice_group null), independent of any component.
// componentSections: [{ component: string|null, rows: [...] }] — rows lacking a `component`
// key get `component: null` (ordinary single-choice trigger, e.g. Rocker/standalone Wrap).
async function replaceTriggerRules(triggerPartNumber, coreRows, componentSections) {
  const { error: delErr } = await supabase.from('part_bundle_rules').delete().eq('trigger_part_number', triggerPartNumber)
  check(`${triggerPartNumber}: delete existing rows`, delErr)

  let sortOrder = 1
  const inserts = []
  for (const core of coreRows) {
    inserts.push({
      trigger_part_number: triggerPartNumber,
      choice_group: null,
      choice_subgroup: null,
      choice_label: null,
      required_part_number: core.required_part_number,
      quantity: core.quantity,
      sort_order: sortOrder++,
      component: null,
    })
  }
  for (const section of componentSections) {
    for (const row of section.rows) {
      inserts.push({
        trigger_part_number: triggerPartNumber,
        choice_group: row.choice_group,
        choice_subgroup: row.choice_subgroup,
        choice_label: row.choice_label,
        required_part_number: row.required_part_number,
        quantity: row.quantity,
        sort_order: sortOrder++,
        component: section.component,
      })
    }
  }

  const { error: insErr } = await supabase.from('part_bundle_rules').insert(inserts)
  check(`${triggerPartNumber}: insert ${inserts.length} rows`, insErr)
  console.log(`${triggerPartNumber}: rebuilt with ${inserts.length} rows.`)
}

const CB0405_CORES = [
  { required_part_number: 'CB0405AMC-23-13', quantity: 2 },
  { required_part_number: 'CB0405AMC-50-13', quantity: 2 },
]
const CB1_CORES = [
  { required_part_number: 'CB1AMC-23-13', quantity: 2 },
  { required_part_number: 'CB1AMC-50-13', quantity: 2 },
]
const AVW_CONTOUR_COMPONENTS = [
  { component: 'Lower Contour', rows: contourCoverRows('Lower', 'AVW') },
  { component: 'Upper Contour', rows: contourCoverRows('Upper', 'AVW') },
]
const KAADY_CONTOUR_COMPONENTS = [
  { component: 'Lower Contour', rows: contourCoverRows('Lower', 'Kaady') },
  { component: 'Upper Contour', rows: contourCoverRows('Upper', 'Kaady') },
]

async function main() {
  // ── Phase 3: Contour standalone — independent Lower/Upper ──────────────────
  await replaceTriggerRules('CB0405', CB0405_CORES, AVW_CONTOUR_COMPONENTS)
  await replaceTriggerRules('CB0405-EL', CB0405_CORES, AVW_CONTOUR_COMPONENTS)
  await replaceTriggerRules('CB2', CB1_CORES, KAADY_CONTOUR_COMPONENTS)
  await replaceTriggerRules('CB2-EL', CB1_CORES, KAADY_CONTOUR_COMPONENTS)

  // ── Phase 6: Side Washer standalone ─────────────────────────────────────────
  const SW_CORES = [{ required_part_number: 'WA1M-72-510-5220-CORE', quantity: 2 }]
  const SW_COMPONENT = [{ component: null, rows: sideWasherRows() }]
  await replaceTriggerRules('SW2', SW_CORES, SW_COMPONENT)
  await replaceTriggerRules('SW2-EL', SW_CORES, SW_COMPONENT)

  // ── Phase 5: Rocker, built from scratch ─────────────────────────────────────
  const ROCKER_COMPONENT = [{ component: null, rows: rockerRows() }]
  await replaceTriggerRules('RB1-0122', [], ROCKER_COMPONENT)
  await replaceTriggerRules('RB1-EL-0122', [], ROCKER_COMPONENT)

  // ── Phase 7 (folded in): standalone Wraps get the two-colour pattern rows too ─
  const WRAP_CORE = (qty) => [{ required_part_number: 'WA1M-72-510-5220-CORE', quantity: qty }]
  await replaceTriggerRules('OT2-WA4', WRAP_CORE(2), [{ component: null, rows: wrapRows(2) }])
  await replaceTriggerRules('OT2-WA4-EL', WRAP_CORE(2), [{ component: null, rows: wrapRows(2) }])
  await replaceTriggerRules('DWA1', WRAP_CORE(4), [{ component: null, rows: wrapRows(4) }])
  await replaceTriggerRules('OT2-DWA1-EL', WRAP_CORE(4), [{ component: null, rows: wrapRows(4) }])

  // ── Phase 4: Wrap Mitter Combos (2 components: Wrap, Mitter) ────────────────
  const wrapMitterRegular = (wrapQty) => [
    { component: 'Wrap', rows: wrapRows(wrapQty) },
    { component: 'Mitter (Regular)', rows: mitterRows('regular') },
  ]
  const wrapMitterMini = (wrapQty) => [
    { component: 'Wrap', rows: wrapRows(wrapQty) },
    { component: 'Mitter (Mini)', rows: mitterRows('mini') },
  ]
  await replaceTriggerRules('OT2-WC3', WRAP_CORE(2), wrapMitterRegular(2))
  await replaceTriggerRules('OT2-WC3-EL', WRAP_CORE(2), wrapMitterRegular(2))
  await replaceTriggerRules('OT2-2WAMC2', WRAP_CORE(4), wrapMitterRegular(4))
  await replaceTriggerRules('W1MM5', WRAP_CORE(2), wrapMitterMini(2))
  await replaceTriggerRules('OT2-W1MM5-EL', WRAP_CORE(2), wrapMitterMini(2))

  // ── Phase 4: Wrap Mitter Contour Combos (4 components: Wrap, Mitter, Lower/Upper Contour) ─
  function wrapMitterContourComponents(brand, wrapQty) {
    const contourComponents = brand === 'AVW' ? AVW_CONTOUR_COMPONENTS : KAADY_CONTOUR_COMPONENTS
    return [
      { component: 'Wrap', rows: wrapRows(wrapQty) },
      { component: 'Mitter (Regular)', rows: mitterRows('regular') },
      ...contourComponents,
    ]
  }
  function wrapMitterContourCores(brand, wrapQty) {
    const contourCores = brand === 'AVW' ? CB0405_CORES : CB1_CORES
    return [...contourCores, ...WRAP_CORE(wrapQty)]
  }
  await replaceTriggerRules('2WAMC2CB0405', wrapMitterContourCores('AVW', 4), wrapMitterContourComponents('AVW', 4))
  await replaceTriggerRules('2WAMC2CB0405-EL', wrapMitterContourCores('AVW', 4), wrapMitterContourComponents('AVW', 4))
  await replaceTriggerRules('2WAMC2CB2', wrapMitterContourCores('Kaady', 4), wrapMitterContourComponents('Kaady', 4))
  await replaceTriggerRules('2WAMC2CB2-EL', wrapMitterContourCores('Kaady', 4), wrapMitterContourComponents('Kaady', 4))
  await replaceTriggerRules('OT2-WC3CB2', wrapMitterContourCores('Kaady', 2), wrapMitterContourComponents('Kaady', 2))
  await replaceTriggerRules('OT2-WC3CB2-EL', wrapMitterContourCores('Kaady', 2), wrapMitterContourComponents('Kaady', 2))
  await replaceTriggerRules('OT2-WC3CB0405', wrapMitterContourCores('AVW', 2), wrapMitterContourComponents('AVW', 2))
  await replaceTriggerRules('OT2-WC3CB0405-EL', wrapMitterContourCores('AVW', 2), wrapMitterContourComponents('AVW', 2))

  // ── Phase 4: Wrap Side Washer Combos ────────────────────────────────────────
  // OT2-WSW4/-EL: 2 components (Wrap, Side Washer) — same physical core used for both.
  await replaceTriggerRules(
    'OT2-WSW4',
    [{ required_part_number: 'WA1M-72-510-5220-CORE', quantity: 2 }, { required_part_number: 'WA1M-72-510-5220-CORE', quantity: 2 }],
    [
      { component: 'Wrap', rows: wrapRows(2) },
      { component: 'Side Washer', rows: sideWasherRows() },
    ]
  )
  await replaceTriggerRules(
    'OT2-WSW4-EL',
    [{ required_part_number: 'WA1M-72-510-5220-CORE', quantity: 2 }, { required_part_number: 'WA1M-72-510-5220-CORE', quantity: 2 }],
    [
      { component: 'Wrap', rows: wrapRows(2) },
      { component: 'Side Washer', rows: sideWasherRows() },
    ]
  )

  // OT2-WACB2/-EL, OT2-WACB0405/-EL: 3 components (Wrap, Lower Contour, Upper Contour) — no
  // Mitter/Side Washer per spec.
  function wrapContourComponents(brand, wrapQty) {
    const contourComponents = brand === 'AVW' ? AVW_CONTOUR_COMPONENTS : KAADY_CONTOUR_COMPONENTS
    return [{ component: 'Wrap', rows: wrapRows(wrapQty) }, ...contourComponents]
  }
  function wrapContourCores(brand, wrapQty) {
    const contourCores = brand === 'AVW' ? CB0405_CORES : CB1_CORES
    return [...contourCores, ...WRAP_CORE(wrapQty)]
  }
  await replaceTriggerRules('OT2-WACB2', wrapContourCores('Kaady', 2), wrapContourComponents('Kaady', 2))
  await replaceTriggerRules('OT2-WACB2-EL', wrapContourCores('Kaady', 2), wrapContourComponents('Kaady', 2))
  await replaceTriggerRules('OT2-WACB0405', wrapContourCores('AVW', 2), wrapContourComponents('AVW', 2))
  await replaceTriggerRules('OT2-WACB0405-EL', wrapContourCores('AVW', 2), wrapContourComponents('AVW', 2))

  console.log('Phases 3-7 rebuild complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
