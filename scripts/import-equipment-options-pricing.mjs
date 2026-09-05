// Phase 0 of the Equipment Options reconciliation (see AGENTS/plan history): the existing
// scripts/import-parts-pricing.mjs only *updates* part numbers that already exist in the `parts`
// table — it can't insert brand-new rows, because it builds its worklist from
// `select part_number from parts`, not from the target list. That's fine for its original
// purpose (refresh pricing for the 3,000+ part image catalog) but useless for backfilling parts
// that have never been in Supabase at all, which is exactly the situation for most of the
// Rocker/Side Washer/Wrap two-color cover part numbers named in the new master spec
// (master_prompt_full_rebuild.md / Quoting Tool Rev 2.xlsx) — an audit fork found 25 such gaps.
//
// This script instead takes an explicit target list (every real, non-"Part Number Needs Created"
// part number referenced by the 7 Lookup sheets + Cores in the master spec) and upserts
// (insert-or-update) each one from the given Items export by exact part-number match — so it
// both backfills genuinely new rows and refreshes existing ones. Safe/idempotent to re-run.
//
// Usage: node scripts/import-equipment-options-pricing.mjs "<path-to-xlsx>" ["<sheet name>"]

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import XLSX from 'xlsx'

function loadEnvLocal() {
  const path = join(process.cwd(), '.env.local')
  const text = readFileSync(path, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    if (match) process.env[match[1]] ??= match[2]
  }
}

loadEnvLocal()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const filePath = process.argv[2]
const sheetName = process.argv[3]
if (!filePath) {
  console.error('Usage: node scripts/import-equipment-options-pricing.mjs "<path-to-xlsx>" ["<sheet name>"]')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Every real part number named anywhere in master_prompt_full_rebuild.md's Cores + 7 Lookup
// sheets (Contour, Wrap, Side Washer, Rocker, Mitter, Top Brush, Tire Items), excluding the
// literal "Part Number Needs Created" sentinel rows.
const TARGET_PART_NUMBERS = [
  // Fixed cores
  'CB0405AMC-23-13', 'CB0405AMC-50-13', 'CB1AMC-23-13', 'CB1AMC-50-13',
  'WA1M-72-510-5220-CORE',
  'RB1AMC-23-13', 'RB1AMC-28-13', 'RB1AMC-41-13',
  'TR1HB-82', 'TR3HB-82',

  // Contour Lookup covers (AVW + Kaady, Lower + Upper, Cloth + Neoglide, x3 colours)
  'CB0405AMA-23-13-S-CL-BK', 'CB0405AMA-23-13-S-CL-BL', 'CB0405AMA-23-13-S-CL-RD',
  'CB0405AMA-23-13-S-NG-BK', 'CB0405AMA-23-13-S-NG-BL', 'CB0405AMA-23-13-S-NG-RD',
  'CB0405AMA-50-13-S-CL-BK', 'CB0405AMA-50-13-S-CL-BL', 'CB0405AMA-50-13-S-CL-RD',
  'CB0405AMA-50-13-S-NG-BK', 'CB0405AMA-50-13-S-NG-BL', 'CB0405AMA-50-13-S-NG-RD',
  'CB1AMA-23-13-S-CL-BK', 'CB1AMA-23-13-S-CL-BL', 'CB1AMA-23-13-S-CL-RD',
  'CB1AMA-23-13-S-NG-BK', 'CB1AMA-23-13-S-NG-BL', 'CB1AMA-23-13-S-NG-RD',
  'CB1AMA-50-13-S-CL-BK', 'CB1AMA-50-13-S-CL-BL', 'CB1AMA-50-13-S-CL-RD',
  'CB1AMA-50-13-S-NG-BK', 'CB1AMA-50-13-S-NG-BL', 'CB1AMA-50-13-S-NG-RD',

  // Wrap Lookup (Available rows only)
  'WA1M-00-510-5220-SS-CL-BK', 'WA1M-00-510-5220-SS-CL-BL', 'WA1M-00-510-5220-SS-CL-RD',
  'WA1M-00-510-5220-SS-NG-BK', 'WA1M-00-510-5220-SS-NG-BL', 'WA1M-00-510-5220-SS-NG-RD',
  'WA1M-00-510-5220-SS-CL-BK-BL', 'WA1M-00-510-5220-SS-CL-RD-BK',
  'WA1M-00-510-5220-SS-NG-BL-BK', 'WA1M-00-510-5220-SS-NG-RD-BK',
  'WA1M-00-510-5220-SS-NG-BK-BL', 'WA1M-00-510-5220-SS-NG-BLRD',

  // Side Washer Lookup (Available rows only)
  'SW1M-00-510-5220-SS-CL-BK', 'SW1M-00-510-5220-SS-CL-BL', 'SW1M-00-510-5220-SS-CL-RD',
  'SW1M-00-510-5220-SS-NG-BK', 'SW1M-00-510-5220-SS-NG-BL',
  'SW1M-00-510-5220-SS-NG-RDBK', 'SW1M-00-510-5220-SS-NG-BKBL', 'SW1M-00-510-5220-SS-BLRD',

  // Rocker Lookup (Available rows only)
  'RB1AMA-23-13-S-CL-BK', 'RB1AMA-23-13-S-CL-BL', 'RB1AMA-23-13-S-CL-RD',
  'RB1AMA-23-13-S-NG-BK', 'RB1AMA-23-13-S-NG-BL', 'RB1AMA-23-13-S-NG-RD',
  'RB1AMA-28-13-S-CL-BK', 'RB1AMA-28-13-S-CL-BL', 'RB1AMA-28-13-S-CL-RD',
  'RB1AMA-28-13-S-NG-BK', 'RB1AMA-28-13-S-NG-BL', 'RB1AMA-28-13-S-NG-RD',
  'RB1AMA-41-13-S-CL-BK', 'RB1AMA-41-13-S-CL-BL',

  // Mitter Lookup
  'MC1E-12W79L-S-CL-AVW-BK', 'MC1E-12W79L-S-CL-AVW-BL', 'MC1E-12W79L-S-CL-AVW-RD',
  'MC1E-04W79L-S-MFBR-BLK', 'MC1E-04W79L-S-MFBR-BLUE', 'MC1E-04W79L-S-MFBR-RED',

  // Top Brush Lookup
  'TR1-BUN-BLACK', 'TR1-BUN-BLUE', 'TR1-BUN-RED',
  'TR5HA-DRYSOFT-CL-BL', 'TR5HA-DRYSOFT-CL-GREY',

  // Tire Items Lookup
  'TB1ADEA-4B-008-104-FTHR-PE-AVW',
  'TB1ADEA-4B-116-094-STEPPE-AVW-K', 'TB1ADEA-4B-116-094-STEPPE-AVW-B', 'TB1ADEA-4B-116-094-STEPPE-AVW-R',
]

function readItemsFromWorkbook(path, sheet) {
  const wb = XLSX.readFile(path)
  const name = sheet || wb.SheetNames.find((n) => n.toLowerCase() !== 'quickbooks desktop export tips') || wb.SheetNames[0]
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null })
  const header = rows[0]
  const colMap = {}
  header.forEach((h, i) => { if (h) colMap[String(h).trim()] = i })

  const required = ['Item', 'Description', 'Price']
  for (const col of required) {
    if (!(col in colMap)) throw new Error(`Expected column "${col}" not found in sheet "${name}"`)
  }

  const byPartNumber = new Map()
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const item = r[colMap['Item']]
    if (!item) continue
    const partNumber = String(item).trim().toUpperCase()
    byPartNumber.set(partNumber, {
      description: r[colMap['Description']] != null ? String(r[colMap['Description']]).trim() : null,
      price: typeof r[colMap['Price']] === 'number' ? r[colMap['Price']] : null,
    })
  }
  return byPartNumber
}

async function main() {
  const itemsByPartNumber = readItemsFromWorkbook(filePath, sheetName)
  console.log(`Parsed ${itemsByPartNumber.size} items from workbook.`)

  const matched = []
  const notInWorkbook = []
  for (const partNumber of TARGET_PART_NUMBERS) {
    const entry = itemsByPartNumber.get(partNumber.toUpperCase())
    if (entry) matched.push({ part_number: partNumber, ...entry, is_active: true })
    else notInWorkbook.push(partNumber)
  }

  console.log(`Target list: ${TARGET_PART_NUMBERS.length}. Matched in workbook: ${matched.length}. Not found: ${notInWorkbook.length}.`)
  if (notInWorkbook.length) {
    console.log('Not found in workbook:', notInWorkbook.join(', '))
  }

  const { data: before } = await supabase
    .from('parts')
    .select('part_number')
    .in('part_number', TARGET_PART_NUMBERS)
  const existedBefore = new Set((before ?? []).map((r) => r.part_number))
  const newInserts = matched.filter((m) => !existedBefore.has(m.part_number))
  const refreshed = matched.filter((m) => existedBefore.has(m.part_number))

  const { error } = await supabase
    .from('parts')
    .upsert(
      matched.map((c) => ({ part_number: c.part_number, description: c.description, unit_price: c.price, is_active: true })),
      { onConflict: 'part_number' }
    )
  if (error) {
    console.error('Upsert failed:', error.message)
    process.exit(1)
  }

  console.log(`Upsert done. ${newInserts.length} new rows inserted, ${refreshed.length} existing rows refreshed.`)
  if (newInserts.length) {
    console.log('Newly inserted:', newInserts.map((m) => m.part_number).join(', '))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
