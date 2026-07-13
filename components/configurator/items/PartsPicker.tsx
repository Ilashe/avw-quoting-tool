'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useParts } from '@/lib/catalog/useParts'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { formatCurrency } from '@/lib/format'

export default function PartsPicker() {
  const { parts, loading, error } = useParts()
  const addPart = useLineItemsStore((s) => s.addPart)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return parts
    return parts.filter(
      (p) => p.part_number.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }, [parts, query])

  return (
    <div>
      <label className="block text-sm font-medium text-ink">Add from Parts Catalog</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by part number or description…"
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
      />

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {loading && <p className="mt-3 text-sm text-slate-400">Loading parts…</p>}

      {!loading && !error && (
        <>
          <p className="mt-2 text-xs text-slate-400">
            {filtered.length} of {parts.length} parts
          </p>
          <div className="mt-2 grid max-h-[28rem] grid-cols-2 gap-3 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((part) => (
              <button
                key={part.part_number}
                type="button"
                onClick={() =>
                  addPart({
                    part_number: part.part_number,
                    description: part.description ?? part.part_number,
                    unit_price: part.unit_price ?? 0,
                    image_url: part.image_url,
                  })
                }
                className="flex flex-col items-start rounded-lg border border-slate-200 p-2 text-left transition hover:border-brand hover:shadow-sm"
              >
                <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-md bg-mist">
                  {part.image_url ? (
                    <Image
                      src={part.image_url}
                      alt={part.part_number}
                      fill
                      sizes="150px"
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No image</span>
                  )}
                </div>
                <p className="mt-1.5 truncate text-xs font-semibold text-ink">{part.part_number}</p>
                <p className="line-clamp-2 text-[11px] text-slate-500">{part.description}</p>
                <p className="mt-auto pt-1 text-xs font-semibold text-brand">
                  {formatCurrency(part.unit_price ?? 0)}
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-slate-400">No parts match your search.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
