// Phase 8 of the Equipment Options reconciliation: enables the "one colour or two?" split for
// every Mitter/Mini Mitter colour-choice row — standalone triggers (choice_group "Mitter curtain
// [...]" / "Mini miter [...]") and the new combo Mitter components from
// phase3to7-rebuild-bundle-rules.mjs (choice_group "Mitter [...]"). Pure UPDATE, no rows
// added/removed, no quantities touched — only sets the new allow_two_color_split flag.
// Requires migration 0067 to be applied first.

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

async function main() {
  const { data, error } = await supabase
    .from('part_bundle_rules')
    .update({ allow_two_color_split: true })
    .or('choice_group.ilike.Mitter curtain [%,choice_group.ilike.Mini miter [%,choice_group.ilike.Mitter [%')
    .select('id')

  if (error) {
    console.error('FAILED:', error.message)
    process.exit(1)
  }
  console.log(`allow_two_color_split set on ${data.length} rows.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
