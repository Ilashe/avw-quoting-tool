// One-off bulk uploader: reads a folder of part-number-named images, uploads
// each to the `part-images` Supabase Storage bucket, and upserts bookkeeping
// rows into `parts` / `part_images` (migration 0008 must be applied first for
// the DB step; the storage upload step works independently of that).
//
// Usage: node scripts/upload-part-images.mjs "<path-to-folder>"

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'node:fs'
import { extname, basename, join } from 'node:path'

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
const BUCKET = 'part-images'
const EXT_PRIORITY = ['.jpg', '.jpeg', '.png', '.avif']
const CONTENT_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif' }

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const folder = process.argv[2]
const dbOnly = process.argv.includes('--db-only')
if (!folder) {
  console.error('Usage: node scripts/upload-part-images.mjs "<path-to-folder>" [--db-only]')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

function pickOneImagePerPart(files) {
  const byPart = new Map() // partNumber -> filename
  let skipped = 0
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (!EXT_PRIORITY.includes(ext)) continue
    const partNumber = basename(file, extname(file)).toUpperCase()
    const existing = byPart.get(partNumber)
    if (!existing) {
      byPart.set(partNumber, file)
      continue
    }
    const existingExt = extname(existing).toLowerCase()
    const existingRank = EXT_PRIORITY.indexOf(existingExt)
    const candidateRank = EXT_PRIORITY.indexOf(ext)
    skipped++
    if (candidateRank < existingRank) byPart.set(partNumber, file) // lower index = higher priority
  }
  return { byPart, skipped }
}

async function withConcurrency(items, limit, worker) {
  const results = []
  let index = 0
  async function run() {
    while (index < items.length) {
      const current = index++
      results[current] = await worker(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: limit }, run))
  return results
}

async function main() {
  const allFiles = readdirSync(folder)
  const { byPart, skipped } = pickOneImagePerPart(allFiles)
  const entries = [...byPart.entries()] // [partNumber, filename][]

  console.log(`Found ${allFiles.length} files, ${entries.length} unique parts, skipped ${skipped} duplicate-format files.`)

  let uploadedPaths = entries.map(([partNumber, filename]) => ({
    partNumber,
    storagePath: `${partNumber}${extname(filename).toLowerCase()}`,
  }))

  if (dbOnly) {
    console.log('--db-only: skipping storage upload, using paths computed from folder listing.')
  } else {
    const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (bucketErr && !/already exists/i.test(bucketErr.message)) {
      console.error('Failed to create/verify bucket:', bucketErr.message)
      process.exit(1)
    }

    let uploaded = 0
    let failed = 0
    uploadedPaths = []

    await withConcurrency(entries, 8, async ([partNumber, filename]) => {
      const ext = extname(filename).toLowerCase()
      const storagePath = `${partNumber}${ext}`
      const buffer = readFileSync(join(folder, filename))
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: CONTENT_TYPES[ext],
        upsert: true,
      })
      if (error) {
        failed++
        console.error(`  upload failed: ${filename} -> ${error.message}`)
        return
      }
      uploaded++
      uploadedPaths.push({ partNumber, storagePath })
      if (uploaded % 250 === 0) console.log(`  uploaded ${uploaded}/${entries.length}...`)
    })

    console.log(`Storage upload done: ${uploaded} uploaded, ${failed} failed.`)
  }

  console.log('Upserting parts + part_images rows...')
  const CHUNK = 500
  let dbFailed = 0

  for (let i = 0; i < uploadedPaths.length; i += CHUNK) {
    const chunk = uploadedPaths.slice(i, i + CHUNK)

    const { error: partsErr } = await supabase
      .from('parts')
      .upsert(
        chunk.map(({ partNumber }) => ({ part_number: partNumber })),
        { onConflict: 'part_number', ignoreDuplicates: true }
      )
    if (partsErr) {
      console.error(`  parts upsert failed for chunk starting at ${i}:`, partsErr.message)
      dbFailed += chunk.length
      continue
    }

    const partNumbers = chunk.map((c) => c.partNumber)
    const { error: delErr } = await supabase.from('part_images').delete().in('part_number', partNumbers)
    if (delErr) {
      console.error(`  part_images cleanup failed for chunk starting at ${i}:`, delErr.message)
    }

    const { error: imagesErr } = await supabase
      .from('part_images')
      .insert(chunk.map(({ partNumber, storagePath }) => ({ part_number: partNumber, storage_path: storagePath, sort_order: 0 })))
    if (imagesErr) {
      console.error(`  part_images insert failed for chunk starting at ${i}:`, imagesErr.message)
      dbFailed += chunk.length
    }
  }

  console.log(`Done. DB rows failed for ${dbFailed} of ${uploadedPaths.length} images.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
