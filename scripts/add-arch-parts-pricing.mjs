// One-off: seeds parts.description/unit_price for arch parts that have a pricing match in the
// client's QuickBooks Items export (Items (2).xlsx) but no photo yet — kept as a script (not a
// migration) for consistency with how the other ~3,000 parts rows are managed.
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

// Sourced from Items (2).xlsx (2026-07-14) — these part numbers have no image yet.
const PARTS = [
  ['AA1-12', 2997, "Arch (Applicator), 12' Wide, Stainless Steel Arch & Manifolds"],
  ['AA1X3', 5064, 'Arch System (Applicator), triple manifolds and CT, SS'],
  ['AA2', 4116, 'Dual Applicator Arch, Stainless Steel Arch & Manifolds'],
  ['FM1A-C-Z', 4077, 'Arch (Penta) for Finishing Module, w/Z-Legs, Requires Bracing to Another Arch'],
  ['OT2-AA0-14', 2544, "Arch (Empty), Octa² Design- 14' Wide"],
  ['OT2-AA0-0622', 2256, 'Arch (Empty), Octa², with (2) Access Holes in Each Leg and 3 Access Holes in the Top Bar'],
  [
    'OT2-AA3X3-0622',
    5675,
    'Arch System Octa² Applicator, Triple Manifolds with Continuous Sides Separated at the top (2-Piece) With CTA and Entrance/Exit Windshield Spray, SS',
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
console.log(`Upserted ${PARTS.length} parts (price + description, no image).`)
