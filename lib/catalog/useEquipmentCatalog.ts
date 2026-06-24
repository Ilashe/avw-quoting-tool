'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, EquipmentItem, EquipmentOption, DependencyRule } from '@/types/equipment'

export interface CatalogData {
  categories: Category[]
  items: EquipmentItem[]
  options: EquipmentOption[]
  rules: DependencyRule[]
}

const EMPTY: CatalogData = { categories: [], items: [], options: [], rules: [] }

/**
 * Client-side fetch of one tab's catalog (categories + items + options + dependency rules).
 * Per decision #8 in PROJECT_STATUS.md, freshness is "refresh-to-see" — no realtime
 * subscriptions, just a fetch on mount.
 */
export function useEquipmentCatalog(tab: string) {
  const [data, setData] = useState<CatalogData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      setLoading(true)
      setError(null)

      const [categoriesRes, itemsRes, rulesRes] = await Promise.all([
        supabase.from('categories').select('*').eq('tab', tab).order('sort_order'),
        supabase
          .from('equipment_items')
          .select('*, equipment_options(*)')
          .eq('is_active', true)
          .order('sku')
          .order('sort_order', { foreignTable: 'equipment_options' }),
        supabase.from('dependency_rules').select('*'),
      ])

      if (cancelled) return

      if (categoriesRes.error || itemsRes.error || rulesRes.error) {
        setError(
          categoriesRes.error?.message ?? itemsRes.error?.message ?? rulesRes.error?.message ?? 'Failed to load catalog'
        )
        setLoading(false)
        return
      }

      const categories = (categoriesRes.data ?? []) as Category[]
      const categoryIds = new Set(categories.map((c) => c.id))

      type ItemRow = EquipmentItem & { equipment_options: EquipmentOption[] }
      const itemRows = (itemsRes.data ?? []) as ItemRow[]
      const itemsForTab = itemRows.filter((row) => row.category_id && categoryIds.has(row.category_id))

      const items: EquipmentItem[] = itemsForTab.map(({ equipment_options, ...item }) => item)
      const options: EquipmentOption[] = itemsForTab.flatMap((row) => row.equipment_options ?? [])

      setData({ categories, items, options, rules: (rulesRes.data ?? []) as DependencyRule[] })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [tab])

  return { ...data, loading, error }
}
