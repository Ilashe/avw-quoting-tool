// One-off: seeds parts.description/unit_price for the Tire Equipment, Top Washers,
// Side Washers, Wrap Mitters Combos, and Shower Rinse Manifolds pickers (migration 0014)
// from the client's QuickBooks Items export (Items (4).xlsx, 2026-07-20). Kept as a script
// (not a migration) for consistency with how the other parts rows are managed — parts/
// part_images rows are always script-managed.
//
// Safe to re-run (upsert by part_number). Does NOT touch images — parts with no existing
// part_images row will render with a placeholder icon in the picker (see MultiPartPicker.tsx).
//
// Usage: node scripts/add-friction-final-rinse-parts-pricing.mjs "<path-to-xlsx>"

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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node scripts/add-friction-final-rinse-parts-pricing.mjs "<path-to-xlsx>"')
  process.exit(1)
}

// Requested part lists (client message, 2026-07-20). OTC-MC2 corrected to OT2-MC2 per
// client confirmation — no "OTC-MC2" exists in the Items export; OT2-MC2 matches the
// naming pattern of the other Octa² parts in the same list and is priced/imaged.
const PART_NUMBERS = [
  // Tire Equipment (EQ-FRIC-004A)
  'TB2', 'TB2-EL', 'TB2-1120', 'TB2-1120-EL', 'TB2-NP', 'TB3', 'TB3-EL', 'TB3-1120', 'TB3-1120-EL',
  'TB4', 'TB4-EL', 'TW2', 'TW2-EL', 'TW2-1655', 'TW2-EL-1655',
  // Top Washers (EQ-FRIC-005A)
  'TR4', 'TR4-EL', 'OT2-TR5', 'OT2-TR5-EL',
  // Side Washers (EQ-FRIC-003A)
  'FM1W', 'CB0405-EL', 'CB0405', 'CB2-EL', 'CB2', 'RB1-EL-0122', 'RB1-0122', 'SW2-EL', 'SW2', 'FM1W-EL',
  // Wrap Mitters Combos (EQ-FRIC-006A)
  'MC2', 'MC2-EL', 'MC2-R-0818', 'MC2-R-EL-0818', 'OT2-MC2', 'OT2-MC2-EL', 'OT2-MM5', 'OT2-MM5-EL',
  'DM2-EL', 'DMM5', 'DMM5-EL', 'OT2-DM2', 'OT2-DM2-EL', 'MM5', 'MM5-EL', 'MM5-R-EL-0818',
  'OT2-MM5-R-0818', 'OT2-MM5-R-EL-0818',
  // Shower Rinse Manifolds (EQ-FRIN-002A)
  'AA5DA-1', 'AA5DC-30', 'AA5DB', 'SQHS1420050', 'FW12', 'HN1213', 'UB-SQ050X1500',
]

function readItemsFromWorkbook(path) {
  const wb = XLSX.readFile(path)
  const name = wb.SheetNames.find((n) => n.toLowerCase() !== 'quickbooks desktop export tips') || wb.SheetNames[0]
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null })
  const header = rows[0]
  const colMap = {}
  header.forEach((h, i) => { if (h) colMap[String(h).trim()] = i })

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
  const byPartNumber = readItemsFromWorkbook(filePath)
  console.log(`Parsed ${byPartNumber.size} items from workbook.`)

  const matched = []
  const unmatched = []
  for (const partNumber of PART_NUMBERS) {
    const entry = byPartNumber.get(partNumber)
    if (entry) matched.push({ part_number: partNumber, ...entry })
    else unmatched.push(partNumber)
  }

  console.log(`Matched: ${matched.length}/${PART_NUMBERS.length}.`)
  if (unmatched.length) {
    console.log('Unmatched (will NOT be upserted, must be excluded from migration):', unmatched)
  }

  const { error } = await supabase
    .from('parts')
    .upsert(
      matched.map((c) => ({ part_number: c.part_number, description: c.description, unit_price: c.price })),
      { onConflict: 'part_number' }
    )
  if (error) {
    console.error('upsert failed:', error.message)
    process.exit(1)
  }
  console.log(`Upserted ${matched.length} parts (price + description).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
