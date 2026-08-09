// One-off: seeds/refreshes parts.description/unit_price for the CB0405 (Side Washers) bundle
// family from the client's latest QuickBooks Items export (Items (7).xlsx, 2026-08-07) — the
// client named this file the source of truth for these part numbers. CB0405 and
// CB0405AMC-23-13 already existed in `parts`; CB0405AMC-50-13 and both colour variants did not.
// Safe to re-run (upsert by part_number).

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

// Sourced from Items (7).xlsx (2026-08-07).
const PARTS = [
  ['CB0405', 13820, 'Free Standing Contour Brush, Hydraulic (AVW Style) (Brushes Not Included)'],
  ['CB0405AMC-23-13', 542.4, 'Core 1323, Lower Contour, AVW, Core Only, 13" Core Dia. x 23"H, Aluminum, per core'],
  ['CB0405AMC-50-13', 936.4, 'Core 1350, Upper Contour, AVW, Core Only, 13" Core Dia. x 50"H, Aluminum, per core'],
  [
    'CB0405AMA-50-13-S-NG-BL',
    2019,
    'Brush 1350, Upper Contour, NeoGlide® Only, AVW Design, 13" Core Dia. x 50"H, Straight-Cut, per brush, Blue',
  ],
  [
    'CB0405AMA-50-13-S-NG-RD',
    2019,
    'Brush 1350, Upper Contour, NeoGlide® Only, AVW Design, 13" Core Dia. x 50"H, Straight-Cut, per brush, Red',
  ],
]

const { error } = await supabase.from('parts').upsert(
  PARTS.map(([part_number, unit_price, description]) => ({ part_number, unit_price, description })),
  { onConflict: 'part_number' }
)

if (error) {
  console.error('upsert failed:', error.message)
  process.exit(1)
}
console.log(`Upserted ${PARTS.length} parts (price + description).`)
