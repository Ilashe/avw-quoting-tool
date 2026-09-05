// Phase 9: corrections from live client feedback after the Sept-2026 reconciliation, re-verified
// against the actual Component Options sheet in Quoting Tool Rev 2.xlsx before implementing:
//
//   1. Spelling: pre-existing DB text "Mini miter [...]" -> "Mini Mitter [...]".
//   2. Material label: Mitter's second material is "Microfiber" per the Mitter Lookup /
//      Component Options sheets, not "Foam" (that generalization from migration 0056 was wrong
//      for Mitter specifically — Wrap/Contour/Side Washer correctly keep "Foam" per 0056,
//      unaffected here). Applies to every Mitter/Mini Mitter row, standalone and inside combos.
//   3. allow_two_color_split restricted to COMBO Mitter components only (component is set) —
//      removed from every standalone (component IS NULL) Mitter/Mini Mitter trigger, per
//      explicit client instruction overriding the Component Options sheet's generic "Yes".
//   4. Six previously-zero-rule SKUs built from their real `parts` descriptions (no "MINI" in
//      description -> Regular; "MINI" -> Mini; matches Component Keywords' own disambiguation
//      rule) using the standard single-component Mitter Lookup chain: MC2, MC2-EL,
//      MC2-R-EL-0818 (Regular); MM5, MM5-EL, MM5-R-EL-0818 (Mini).
//   5. Five SKUs whose descriptions say "Double"/"Dual" (DM2-EL, OT2-DM2, OT2-DM2-EL, DMM5,
//      DMM5-EL) are NOT built — "Double"/"Dual" isn't a documented Mitter quantity modifier
//      anywhere in the spec, so guessing a x2 multiplier would be exactly the invented logic the
//      client told us to avoid. Flagged NEEDS REVIEW in pendingPartBadges.ts instead (separate
//      code edit, not this script).
//   6. equipment_items renamed (display name only — metadata.field_key left untouched so
//      existing dependency_rules and any already-saved quotes keep working):
//        EQ-FRIC-006  "Wrap Mitter Combos"          -> "Mitters"
//        EQ-FRIC-006A "Wrap Mitter Combos Selection" -> "Mitters Selection"
//        EQ-FRIC-010  "Wrap Mitter Contour Combos"          -> "Wrap Mitter Combos"
//        EQ-FRIC-010A "Wrap Mitter Contour Combos Selection" -> "Wrap Mitter Combos Selection"
//      (renamed in that order so the two never collide even transiently).
//   7. The 5 real Wrap+Mitter combo SKUs (OT2-WC3, OT2-WC3-EL, OT2-2WAMC2, W1MM5,
//      OT2-W1MM5-EL) moved from EQ-FRIC-006A (now "Mitters Selection") to EQ-FRIC-008A ("Wrap
//      Sidewasher Combos Selection") — per explicit client instruction. Their part_bundle_rules
//      are untouched (rules are keyed by trigger_part_number, not by picker).
//   8. OT2-MC2 AND (per client follow-up confirmation) OT2-MC2-EL, MC2-R-0818, OT2-MM5,
//      OT2-MM5-EL, OT2-MM5-R-0818, OT2-MM5-R-EL-0818 removed from Top Washers Selection
//      (EQ-FRIC-005A) — all confirmed duplicates of copies already in the renamed Mitters
//      Selection. OT2-MC2-R-EL-0818 and MC2-0516 are NOT duplicated anywhere else, so they stay
//      in Top Washers Selection untouched.
//
// Idempotent where practical (dedupe checks before insert; renames/moves are safe to re-run).

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

async function main() {
  // ── 1 & 2: spelling + Foam -> Microfiber, every Mitter row (standalone + combo) ──────────
  // Must also match "%miter%" (the misspelling itself, single-t) or "Mini miter [...]" rows
  // would never be found to fix.
  const { data: mitterRows, error: selErr } = await supabase
    .from('part_bundle_rules')
    .select('id, component, choice_group, choice_subgroup')
    .or('choice_group.ilike.%mitter%,choice_group.ilike.%miter%,component.ilike.Mitter%')
  check('select all mitter rows', selErr)

  let fixed = 0
  for (const row of mitterRows) {
    const newGroup = (row.choice_group ?? '')
      .replace(/Mini miter/g, 'Mini Mitter')
      .replace(/\[FOAM\]/g, '[MICROFIBER]')
    const newSubgroup = row.choice_subgroup === 'Foam' ? 'Microfiber' : row.choice_subgroup
    if (newGroup !== row.choice_group || newSubgroup !== row.choice_subgroup) {
      const { error } = await supabase
        .from('part_bundle_rules')
        .update({ choice_group: newGroup, choice_subgroup: newSubgroup })
        .eq('id', row.id)
      check(`update row ${row.id}`, error)
      fixed++
    }
  }
  console.log(`1&2: fixed spelling/material label on ${fixed} of ${mitterRows.length} Mitter rows.`)

  // ── 3: allow_two_color_split only for combo (component set) Mitter rows ─────────────────
  const { data: standaloneReset, error: resetErr } = await supabase
    .from('part_bundle_rules')
    .update({ allow_two_color_split: false })
    .is('component', null)
    .or('choice_group.ilike.%mitter%')
    .select('id')
  check('reset allow_two_color_split on standalone mitter rows', resetErr)
  console.log(`3: allow_two_color_split cleared on ${standaloneReset.length} standalone Mitter rows (combo Mitter rows untouched, stay true).`)

  // ── 4: build the 6 unambiguous new SKUs ─────────────────────────────────────────────────
  function mitterRowsFor(size /* 'regular' | 'mini' */) {
    const qty = { regular: { Cloth: 42, Microfiber: 63 }, mini: { Cloth: 28, Microfiber: 42 } }[size]
    const groupPrefix = size === 'regular' ? 'Mitter curtain' : 'Mini Mitter'
    const parts = {
      Cloth: [['Black', 'MC1E-12W79L-S-CL-AVW-BK'], ['Blue', 'MC1E-12W79L-S-CL-AVW-BL'], ['Red', 'MC1E-12W79L-S-CL-AVW-RD']],
      Microfiber: [['Black', 'MC1E-04W79L-S-MFBR-BLK'], ['Blue', 'MC1E-04W79L-S-MFBR-BLUE'], ['Red', 'MC1E-04W79L-S-MFBR-RED']],
    }
    const rows = []
    for (const material of ['Cloth', 'Microfiber']) {
      for (const [label, partNumber] of parts[material]) {
        rows.push({
          choice_group: `${groupPrefix} [${material.toUpperCase()}]`,
          choice_subgroup: material,
          choice_label: label,
          required_part_number: partNumber,
          quantity: qty[material],
        })
      }
    }
    return rows
  }

  async function buildStandaloneMitter(triggerPartNumber, size) {
    const { data: existing } = await supabase.from('part_bundle_rules').select('id').eq('trigger_part_number', triggerPartNumber)
    if (existing.length > 0) {
      console.log(`4: ${triggerPartNumber} already has rules, skipping.`)
      return
    }
    const rows = mitterRowsFor(size).map((r, i) => ({
      trigger_part_number: triggerPartNumber,
      choice_group: r.choice_group,
      choice_subgroup: r.choice_subgroup,
      choice_label: r.choice_label,
      required_part_number: r.required_part_number,
      quantity: r.quantity,
      sort_order: i + 1,
      component: null,
      allow_two_color_split: false,
    }))
    const { error } = await supabase.from('part_bundle_rules').insert(rows)
    check(`insert ${triggerPartNumber}`, error)
    console.log(`4: built ${triggerPartNumber} (${size}), ${rows.length} rows.`)
  }

  await buildStandaloneMitter('MC2', 'regular')
  await buildStandaloneMitter('MC2-EL', 'regular')
  await buildStandaloneMitter('MC2-R-EL-0818', 'regular')
  await buildStandaloneMitter('MM5', 'mini')
  await buildStandaloneMitter('MM5-EL', 'mini')
  await buildStandaloneMitter('MM5-R-EL-0818', 'mini')

  // ── 6: rename equipment_items (display name only) ───────────────────────────────────────
  async function renameItem(sku, name) {
    const { error } = await supabase.from('equipment_items').update({ name }).eq('sku', sku)
    check(`rename ${sku}`, error)
    console.log(`6: ${sku} -> "${name}"`)
  }
  await renameItem('EQ-FRIC-006', 'Mitters')
  await renameItem('EQ-FRIC-006A', 'Mitters Selection')
  await renameItem('EQ-FRIC-010', 'Wrap Mitter Combos')
  await renameItem('EQ-FRIC-010A', 'Wrap Mitter Combos Selection')

  // ── 7: move the 5 Wrap+Mitter combo SKUs from Mitters Selection to Wrap Sidewasher Combos Selection ─
  const { data: mittersSelection, error: msErr } = await supabase.from('equipment_items').select('id').eq('sku', 'EQ-FRIC-006A').single()
  check('lookup EQ-FRIC-006A', msErr)
  const { data: wrapSidewasherSelection, error: wsErr } = await supabase.from('equipment_items').select('id').eq('sku', 'EQ-FRIC-008A').single()
  check('lookup EQ-FRIC-008A', wsErr)

  const toMove = ['OT2-WC3', 'OT2-WC3-EL', 'OT2-2WAMC2', 'W1MM5', 'OT2-W1MM5-EL']
  const { data: maxSort } = await supabase
    .from('equipment_options')
    .select('sort_order')
    .eq('item_id', wrapSidewasherSelection.id)
    .order('sort_order', { ascending: false })
    .limit(1)
  let nextSort = (maxSort[0]?.sort_order ?? 0) + 1

  for (const sku of toMove) {
    const { error: delErr } = await supabase
      .from('equipment_options')
      .delete()
      .eq('item_id', mittersSelection.id)
      .eq('option_value', sku)
    check(`remove ${sku} from Mitters Selection`, delErr)

    const { error: insErr } = await supabase.from('equipment_options').insert({
      item_id: wrapSidewasherSelection.id,
      option_key: 'wrap_sidewasher_combos_parts',
      option_label: sku,
      option_value: sku,
      sort_order: nextSort++,
    })
    check(`add ${sku} to Wrap Sidewasher Combos Selection`, insErr)
  }
  console.log(`7: moved ${toMove.length} SKUs from Mitters Selection to Wrap Sidewasher Combos Selection.`)

  // ── 8: remove duplicate Mitter SKUs from Top Washers Selection (kept only in Mitters Selection) ─
  const { data: topWashersSelection, error: twErr } = await supabase.from('equipment_items').select('id').eq('sku', 'EQ-FRIC-005A').single()
  check('lookup EQ-FRIC-005A', twErr)
  const duplicateSkus = ['OT2-MC2', 'OT2-MC2-EL', 'MC2-R-0818', 'OT2-MM5', 'OT2-MM5-EL', 'OT2-MM5-R-0818', 'OT2-MM5-R-EL-0818']
  const { error: dedupErr, data: dedupData } = await supabase
    .from('equipment_options')
    .delete()
    .eq('item_id', topWashersSelection.id)
    .in('option_value', duplicateSkus)
    .select('option_value')
  check('remove duplicate Mitter SKUs from Top Washers Selection', dedupErr)
  console.log(`8: removed ${dedupData.length} duplicate Mitter SKUs from Top Washers Selection (kept in Mitters Selection): ${dedupData.map((d) => d.option_value).join(', ')}`)

  console.log('Phase 9 complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
