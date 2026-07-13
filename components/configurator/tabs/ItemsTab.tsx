'use client'

import { useSelectionsStore } from '@/store/selectionsStore'
import PartsPicker from '../items/PartsPicker'
import LineItemsList from '../items/LineItemsList'

export default function ItemsTab() {
  const discount = useSelectionsStore((s) => s.values['items_discount_percent'])
  const notes = useSelectionsStore((s) => s.values['items_notes'])
  const setField = useSelectionsStore((s) => s.setField)

  return (
    <div className="space-y-6">
      <PartsPicker />
      <LineItemsList />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">Discount (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={(discount as number) ?? ''}
            onChange={(e) => setField('items_discount_percent', e.target.value === '' ? null : Number(e.target.value))}
            className="mt-1 w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Internal Notes</label>
          <p className="text-[11px] text-slate-400">Not shown on customer-facing output.</p>
          <textarea
            value={(notes as string) ?? ''}
            onChange={(e) => setField('items_notes', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>
    </div>
  )
}
