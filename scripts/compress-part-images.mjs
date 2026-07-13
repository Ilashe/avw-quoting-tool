// One-off: generates resized/compressed thumbnails from the local original
// part images and uploads them to a SEPARATE `part-images-thumb` bucket.
// The original `part-images` bucket (full-res) is never touched or
// overwritten — this is purely additive, so it stays fully reversible and
// the originals remain available if a higher-res view is ever needed.
//
// Usage: node scripts/compress-part-images.mjs "<path-to-folder>"

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
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
const THUMB_BUCKET = 'part-images-thumb'
const MAX_DIMENSION = 800
const EXT_PRIORITY = ['.jpg', '.jpeg', '.png', '.avif']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const folder = process.argv[2]
if (!folder) {
  console.error('Usage: node scripts/compress-part-images.mjs "<path-to-folder>"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Same de-dup rule as the original uploader: one image per part number.
function pickOneImagePerPart(files) {
  const byPart = new Map()
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (!EXT_PRIORITY.includes(ext)) continue
    const partNumber = basename(file, extname(file)).toUpperCase()
    const existing = byPart.get(partNumber)
    if (!existing) {
      byPart.set(partNumber, file)
      continue
    }
    const existingRank = EXT_PRIORITY.indexOf(extname(existing).toLowerCase())
    const candidateRank = EXT_PRIORITY.indexOf(ext)
    if (candidateRank < existingRank) byPart.set(partNumber, file)
  }
  return byPart
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

async function compress(filePath, ext) {
  const input = sharp(readFileSync(filePath)).resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (ext === '.png') {
    // Preserve transparency; palette:true auto-quantizes flat-color images
    // (common for line-art part diagrams) for a big additional size cut.
    return { buffer: await input.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true }).toBuffer(), contentType: 'image/png' }
  }
  if (ext === '.avif') {
    return { buffer: await input.avif({ quality: 60 }).toBuffer(), contentType: 'image/avif' }
  }
  // jpg/jpeg
  return { buffer: await input.jpeg({ quality: 78, mozjpeg: true }).toBuffer(), contentType: 'image/jpeg' }
}

async function main() {
  const allFiles = readdirSync(folder)
  const byPart = pickOneImagePerPart(allFiles)
  const entries = [...byPart.entries()]
  console.log(`Compressing ${entries.length} part images to max ${MAX_DIMENSION}px, uploading to "${THUMB_BUCKET}"...`)

  const { error: bucketErr } = await supabase.storage.createBucket(THUMB_BUCKET, { public: true })
  if (bucketErr && !/already exists/i.test(bucketErr.message)) {
    console.error('Failed to create/verify thumb bucket:', bucketErr.message)
    process.exit(1)
  }

  let originalBytes = 0
  let compressedBytes = 0
  let done = 0
  let failed = 0

  await withConcurrency(entries, 6, async ([partNumber, filename]) => {
    const ext = extname(filename).toLowerCase()
    const filePath = join(folder, filename)
    try {
      const original = readFileSync(filePath)
      const { buffer, contentType } = await compress(filePath, ext)
      const storagePath = `${partNumber}${ext}` // same path convention as the original bucket
      const { error } = await supabase.storage.from(THUMB_BUCKET).upload(storagePath, buffer, {
        contentType,
        upsert: true,
      })
      if (error) {
        failed++
        console.error(`  failed: ${filename} -> ${error.message}`)
        return
      }
      originalBytes += original.length
      compressedBytes += buffer.length
      done++
      if (done % 250 === 0) console.log(`  ${done}/${entries.length}...`)
    } catch (err) {
      failed++
      console.error(`  failed: ${filename} ->`, err.message)
    }
  })

  console.log(`Done. ${done} uploaded, ${failed} failed.`)
  console.log(`Original total: ${(originalBytes / 1024 / 1024).toFixed(1)}MB, compressed total: ${(compressedBytes / 1024 / 1024).toFixed(1)}MB (${(100 - (compressedBytes / originalBytes) * 100).toFixed(1)}% smaller)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
