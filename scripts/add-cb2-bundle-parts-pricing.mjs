// One-off: seeds/refreshes parts.description/unit_price for the CB2/CB2-EL (Side Washers,
// Kaady-style contour) bundle family from Items (7).xlsx (2026-08-07), the client's named
// source of truth for these part numbers. CB2, CB2-EL, CB1AMC-23-13, CB1AMA-50-13-S-NG-BL
// already existed in `parts`; CB1AMC-50-13 and the Black/Red colour variants did not.
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
  ['CB2', 13820, 'Set-Contour Brushes, (Kaady Style) Arms Top & Bottom, with Motor Mount Sleeve (Brushes Not Included)'],
  ['CB2-EL', 24440, 'Set-Contour Brushes, Arms Top & Bottom, with Motor Mount Sleeve, Electric Drive (Brushes Not Included)'],
  ['CB1AMC-23-13', 542.4, 'Core 1323, Lower Contour, Kaady, Core Only, 13" Core Dia. x 23"H, Aluminum, per core'],
  ['CB1AMC-50-13', 936.4, 'Core 1350, Upper Contour, Core Only, (CB1AMC-50-13), 13" Core Dia. x 50"H, Aluminum, per core'],
  [
    'CB1AMA-50-13-S-NG-BK',
    1548,
    'Brush 1350, Upper Contour, NeoGlide® Only, (CB1AMA-50-13-S-NG), Straight-Cut for 13" Core Dia. x 50"H, per brush, Black',
  ],
  [
    'CB1AMA-50-13-S-NG-BL',
    1548,
    'Brush 1350, Upper Contour, NeoGlide® Only, (CB1AMA-50-13-S-NG), Straight-Cut for 13" Core Dia. x 50"H, per brush, Blue',
  ],
  [
    'CB1AMA-50-13-S-NG-RD',
    1548,
    'Brush 1350, Upper Contour, NeoGlide® Only, (CB1AMA-50-13-S-NG), Straight-Cut for 13" Core Dia. x 50"H, per brush, Red',
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
