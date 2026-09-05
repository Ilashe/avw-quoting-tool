'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PartBundleRule } from '@/types/parts'

/**
 * Client-side fetch of bundle rules whose trigger_part_number is one of the given part
 * numbers (a picker's own selectable options). Rules are keyed by part number, not by field,
 * so the same rule fires from any picker the trigger part is selectable in.
 */
export function usePartBundleRules(triggerPartNumbers: string[]) {
  const key = triggerPartNumbers.slice().sort().join(',')
  const [rules, setRules] = useState<PartBundleRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      setLoading(true)

      if (triggerPartNumbers.length === 0) {
        if (!cancelled) {
          setRules([])
          setLoading(false)
        }
        return
      }

      const { data, error } = await supabase
        .from('part_bundle_rules')
        .select('id, trigger_part_number, choice_group, choice_subgroup, choice_label, required_part_number, quantity, sort_order, component, allow_two_color_split')
        .in('trigger_part_number', triggerPartNumbers)
        .order('sort_order', { ascending: true })

      if (cancelled) return

      // Table may not exist yet in environments where migration 0017 hasn't been run —
      // degrade to "no bundle rules" rather than surfacing an error in the picker UI.
      setRules(error ? [] : (data as PartBundleRule[]))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { rules, loading }
}
