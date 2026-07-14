'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PartWithImage } from '@/types/parts'

/**
 * Client-side fetch of a specific, small set of parts (by part_number) plus their
 * first image. Used by multi_part_picker fields (e.g. Robot Arch), where the
 * eligible parts are a curated list from equipment_options, not the whole catalog.
 */
export function usePartsByNumbers(partNumbers: string[]) {
  const key = partNumbers.slice().sort().join(',')
  const [parts, setParts] = useState<PartWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      setLoading(true)
      setError(null)

      if (partNumbers.length === 0) {
        if (!cancelled) {
          setParts([])
          setLoading(false)
        }
        return
      }

      const { data, error: fetchError } = await supabase
        .from('parts')
        .select('part_number, description, unit_price, is_active, part_images(storage_path, sort_order)')
        .in('part_number', partNumbers)

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      type Row = {
        part_number: string
        description: string | null
        unit_price: number | null
        is_active: boolean
        part_images: { storage_path: string; sort_order: number }[]
      }

      const rows = (data ?? []) as Row[]
      const resolved: PartWithImage[] = rows.map((row) => {
        const image = [...row.part_images].sort((a, b) => a.sort_order - b.sort_order)[0]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { parts, loading, error }
}
