'use client'

import Image from 'next/image'
import { useLineItemsStore, lineItemsTotal } from '@/store/lineItemsStore'
import { formatCurrency } from '@/lib/format'

export default function LineItemsList() {
  const items = useLineItemsStore((s) => s.items)
  const updateItem = useLineItemsStore((s) => s.updateItem)
  const removeItem = useLineItemsStore((s) => s.removeItem)
  const addCustom = useLineItemsStore((s) => s.addCustom)

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-ink">Quote Line Items</label>
        <button
          type="button"
          onClick={addCustom}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-mist"
        >
          + Add Custom Item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No line items yet. Pick a part above or add a custom item.</p>
      ) : (
        <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-mist">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.description} fill sizes="48px" className="object-contain" unoptimized />
                ) : (
                  <span className="text-[9px] text-slate-400">No img</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {item.part_number && (
                  <p className="text-[11px] font-semibold text-slate-400">{item.part_number}</p>
                )}
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                  readOnly={item.part_number !== null}
                  className="w-full truncate border-none bg-transparent p-0 text-sm text-ink outline-none read-only:cursor-default"
                />
              </div>

              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                className="w-14 shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />

              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(item.id, { unit_price: Math.max(0, Number(e.target.value) || 0) })}
                className="w-24 shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />

              <p className="w-24 shrink-0 text-right text-sm font-semibold text-ink">
                {formatCurrency(item.unit_price * item.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="shrink-0 text-slate-300 transition hover:text-red-500"
                aria-label="Remove line item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <p className="text-sm font-semibold text-ink">
          Items Subtotal: <span className="font-mono">{formatCurrency(lineItemsTotal(items))}</span>
        </p>
      </div>
    </div>
  )
}
