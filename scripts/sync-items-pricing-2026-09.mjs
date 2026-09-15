// General pricing refresh from the client's latest QuickBooks Items export
// (C:\Users\HomePC\Desktop\Items.xlsx, 2026-09-14). Client said this file will be updated and
// re-supplied periodically — this script is meant to be re-run against each new export (just
// point ITEMS_XLSX_PATH at the new file).
//
// Two things, per explicit client instruction:
//
//   1. Refresh price/description for every part ALREADY in the `parts` table:
//      - Found in the workbook with a numeric price -> update description + unit_price.
//      - Found but with no price, or not found at all -> unit_price = 0.00 ("for equipment that
//        has no price, just put 0.00 there"). Description is left untouched when the part isn't
//        found at all (found-but-blank-price rows still get their description updated).
//      Dry-run comparison before this was written showed only 2 of 3,136 existing parts would
//      flip from a real price to $0.00 (R-BCN6AA-2025, VA3875C) — low risk, confirmed with client
//      before running.
//
//   2. Import every "BC"-prefixed item (the belt-conveyor part-number family — see
//      lib/conveyor/beltPartNumber.ts) as new/updated `parts` rows, EXCLUDING part numbers
//      containing "BASE" (explicitly marked "FOR PRICING ONLY. DO NOT QUOTE, ORDER, OR INVOICE
//      THIS ITEM." in their own description — not real orderable line items). This is what lets
//      SummaryPanel.tsx look up a real price/description for the generated Belt Part Number
//      instead of always showing $0.00 — the workbook has exact-match pricing for the generated
//      shape (e.g. "BCD3-1020-120" -> $209,609, confirmed against the app's own test case).
//
// Usage: node scripts/sync-items-pricing-2026-09.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import XLSX from 'xlsx'

const ITEMS_XLSX_PATH = 'C:/Users/HomePC/Desktop/Items.xlsx'

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
  const itemsByPartNumber = readItemsFromWorkbook(ITEMS_XLSX_PATH)
  console.log(`Parsed ${itemsByPartNumber.size} items from workbook.`)

  // ── 1. Refresh existing parts, zeroing out anything with no price ──────────────────────
  const existingPartNumbers = await fetchAllPartNumbers()
  console.log(`Found ${existingPartNumbers.length} parts already in the DB.`)

  const updates = []
  let zeroed = 0
  let priced = 0
  for (const partNumber of existingPartNumbers) {
    const entry = itemsByPartNumber.get(partNumber)
    if (entry && entry.price !== null) {
      updates.push({ part_number: partNumber, description: entry.description, unit_price: entry.price })
      priced++
    } else {
      // Not found in the workbook at all, or found with a blank price -> $0.00. Keep the
      // existing description if the workbook has nothing better to offer.
      updates.push({ part_number: partNumber, description: entry?.description ?? undefined, unit_price: 0 })
      zeroed++
    }
  }

  const CHUNK = 500
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK)
    // Split into "has a description to write" vs "leave description alone" so we don't
    // overwrite a good existing description with undefined via upsert semantics.
    const withDesc = chunk.filter((c) => c.description !== undefined)
    const priceOnly = chunk.filter((c) => c.description === undefined)

    if (withDesc.length) {
      const { error } = await supabase
        .from('parts')
        .upsert(withDesc.map((c) => ({ part_number: c.part_number, description: c.description, unit_price: c.unit_price })), {
          onConflict: 'part_number',
        })
      if (error) { console.error('upsert (with description) failed:', error.message); process.exit(1) }
    }
    for (const c of priceOnly) {
      const { error } = await supabase.from('parts').update({ unit_price: c.unit_price }).eq('part_number', c.part_number)
      if (error) { console.error(`price-only update failed for ${c.part_number}:`, error.message); process.exit(1) }
    }
  }
  console.log(`1. Existing parts refreshed: ${priced} priced from workbook, ${zeroed} set to $0.00 (no match/no price).`)

  // ── 2. Import BC-prefixed belt-conveyor part numbers (excludes "-BASE" pricing-only rows) ─
  const bcEntries = []
  for (const [partNumber, entry] of itemsByPartNumber) {
    if (!partNumber.startsWith('BC')) continue
    if (partNumber.includes('BASE')) continue
    bcEntries.push({ part_number: partNumber, description: entry.description, unit_price: entry.price ?? 0 })
  }
  console.log(`2. Found ${bcEntries.length} BC-prefixed items to import (excluding -BASE rows).`)

  for (let i = 0; i < bcEntries.length; i += CHUNK) {
    const chunk = bcEntries.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('parts')
      .upsert(chunk.map((c) => ({ part_number: c.part_number, description: c.description, unit_price: c.unit_price, is_active: true })), {
        onConflict: 'part_number',
      })
    if (error) { console.error('BC import upsert failed:', error.message); process.exit(1) }
  }
  console.log(`2. BC-prefixed parts imported/updated: ${bcEntries.length}.`)

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
