// One-off importer: reads the QuickBooks "Items" export (.xlsx) and upserts
// price/description into the `parts` table by exact part_number match
// (Item column, case-insensitive). Parts with no matching Item are left
// untouched and written out to unmatched-parts.csv for review.
//
// Usage: node scripts/import-parts-pricing.mjs "<path-to-xlsx>" ["<sheet name>"]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
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
  console.error('Usage: node scripts/import-parts-pricing.mjs "<path-to-xlsx>" ["<sheet name>"]')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

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

async function fetchAllPartNumbers() {
  let all = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase.from('parts').select('part_number').range(from, from + PAGE - 1)
    if (error) throw error
    if (!data.length) break
    all = all.concat(data.map((d) => d.part_number))
    from += PAGE
    if (data.length < PAGE) break
  }
  return all
}

async function main() {
  const itemsByPartNumber = readItemsFromWorkbook(filePath, sheetName)
  console.log(`Parsed ${itemsByPartNumber.size} items from workbook.`)

  const allPartNumbers = await fetchAllPartNumbers()
  console.log(`Found ${allPartNumbers.length} parts in DB.`)

  const matched = []
  const unmatched = []
  for (const partNumber of allPartNumbers) {
    const entry = itemsByPartNumber.get(partNumber)
    if (entry) matched.push({ part_number: partNumber, ...entry })
    else unmatched.push(partNumber)
  }

  console.log(`Matched: ${matched.length}. Unmatched: ${unmatched.length}.`)

  const CHUNK = 500
  let failed = 0
  for (let i = 0; i < matched.length; i += CHUNK) {
    const chunk = matched.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('parts')
      .upsert(
        chunk.map((c) => ({ part_number: c.part_number, description: c.description, unit_price: c.price })),
        { onConflict: 'part_number' }
      )
    if (error) {
      console.error(`  upsert failed for chunk starting at ${i}:`, error.message)
      failed += chunk.length
    }
  }

  console.log(`Upsert done. ${matched.length - failed} succeeded, ${failed} failed.`)

  const outPath = join(process.cwd(), 'scripts', 'unmatched-parts.csv')
  writeFileSync(outPath, 'part_number\n' + unmatched.sort().join('\n') + '\n')
  console.log(`Wrote ${unmatched.length} unmatched part numbers to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
