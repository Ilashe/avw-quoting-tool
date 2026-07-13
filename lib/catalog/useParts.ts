'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PartWithImage } from '@/types/parts'

/**
 * Client-side fetch of every priced part (unit_price not null) plus its first
 * image, resolved to a public Storage URL. Only ~1,900 rows today, so one
 * fetch + client-side search is simpler than a server-side search endpoint.
 */
export function useParts() {
  const [parts, setParts] = useState<PartWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      setLoading(true)
      setError(null)

      type Row = {
        part_number: string
        description: string | null
        unit_price: number | null
        is_active: boolean
        part_images: { storage_path: string; sort_order: number }[]
      }

      // PostgREST caps a single request at 1000 rows — page through all of them.
      const PAGE = 1000
      let rows: Row[] = []
      let from = 0
      while (true) {
        const { data, error: fetchError } = await supabase
          .from('parts')
          .select('part_number, description, unit_price, is_active, part_images(storage_path, sort_order)')
          .eq('is_active', true)
          .not('unit_price', 'is', null)
          .order('part_number')
          .range(from, from + PAGE - 1)

        if (cancelled) return

        if (fetchError) {
          setError(fetchError.message)
          setLoading(false)
          return
        }

        const page = (data ?? []) as Row[]
        rows = rows.concat(page)
        if (page.length < PAGE) break
        from += PAGE
      }
      const resolved: PartWithImage[] = rows.map((row) => {
        const image = [...row.part_images].sort((a, b) => a.sort_order - b.sort_order)[0]
        // part-images-thumb holds resized/compressed copies for fast loading;
        // part-images (full-res originals) is untouched and still available.
        const imageUrl = image
          ? supabase.storage.from('part-images-thumb').getPublicUrl(image.storage_path).data.publicUrl
          : null
        return {
          part_number: row.part_number,
          description: row.description,
          unit_price: row.unit_price,
          is_active: row.is_active,
          image_url: imageUrl,
        }
      })

      setParts(resolved)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { parts, loading, error }
}
