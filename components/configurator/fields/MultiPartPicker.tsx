'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { usePartsByNumbers } from '@/lib/catalog/usePartsByNumbers'
import { formatCurrency } from '@/lib/format'
import type { EquipmentOption } from '@/types/equipment'
import type { SelectedPart } from '@/types/parts'

export default function MultiPartPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: EquipmentOption[]
  value: SelectedPart[] | null
  onChange: (parts: SelectedPart[]) => void
}) {
  const partNumbers = options.map((o) => o.option_value)
  const { parts: fetchedParts, loading, error } = usePartsByNumbers(partNumbers)
  // Supabase's `.in()` filter doesn't preserve argument order, so re-sort to match the
  // curated equipment_options sort_order (partNumbers is already in that order).
  const orderIndex = new Map(partNumbers.map((pn, i) => [pn, i]))
  const parts = [...fetchedParts].sort(
    (a, b) => (orderIndex.get(a.part_number) ?? 0) - (orderIndex.get(b.part_number) ?? 0)
  )
  const selected = value ?? []
  const selectedNumbers = new Set(selected.map((p) => p.part_number))
  const [hovered, setHovered] = useState<{ partNumber: string; placement: 'above' | 'below' } | null>(null)

  function toggle(part: SelectedPart) {
    if (selectedNumbers.has(part.part_number)) {
      onChange(selected.filter((p) => p.part_number !== part.part_number))
    } else {
      onChange([...selected, part])
    }
  }

  // Card is roughly 230px tall (image + text + padding) — if there isn't room below the
  // thumbnail in the viewport, flip it to open above instead.
  const CARD_HEIGHT_ESTIMATE = 230
  function handleEnter(e: React.MouseEvent<HTMLDivElement>, partNumber: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setHovered({ partNumber, placement: spaceBelow < CARD_HEIGHT_ESTIMATE ? 'above' : 'below' })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {loading && <p className="mt-2 text-sm text-slate-400">Loading options…</p>}

      {!loading && !error && (
        <>
          {selected.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">{selected.length} selected</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-200 p-3">
            {parts.map((part) => {
              const isSelected = selectedNumbers.has(part.part_number)
              const selectedPart: SelectedPart = {
                part_number: part.part_number,
                description: part.description ?? part.part_number,
                unit_price: part.unit_price ?? 0,
                image_url: part.image_url,
              }
              const isHovered = hovered?.partNumber === part.part_number
              const placement = hovered?.placement ?? 'below'
              return (
                <div
                  key={part.part_number}
                  className="relative"
                  onMouseEnter={(e) => handleEnter(e, part.part_number)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    type="button"
                    onClick={() => toggle(selectedPart)}
                    className={`relative flex size-14 items-center justify-center overflow-hidden rounded-md border-2 bg-mist transition ${
                      isSelected ? 'border-brand' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    {part.image_url ? (
                      <Image
                        src={part.image_url}
                        alt={part.part_number}
                        fill
                        sizes="56px"
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <ImageOff className="size-5 text-slate-300" strokeWidth={1.5} />
                    )}
                    {isSelected && (
                      <span className="absolute right-0.5 top-0.5 flex size-3.5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* Hover detail card — only mounted while actually hovered (not just
                      opacity-toggled), so we're not loading 26 preview images at once.
                      Opens below the thumbnail by default, but flips above if there isn't
                      enough room below in the viewport (see handleEnter). */}
                  {isHovered && (
                    <div
                      className={`pointer-events-none absolute left-1/2 z-30 w-48 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg ${
                        placement === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
                      }`}
                    >
                      <div className="relative mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded-md bg-mist">
                        {part.image_url ? (
                          <Image
                            src={part.image_url}
                            alt={part.part_number}
                            fill
                            sizes="180px"
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <ImageOff className="size-6 text-slate-300" strokeWidth={1.5} />
                            <span className="text-[10px] text-slate-400">No photo yet</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-ink">{part.part_number}</p>
                      <p className="mt-0.5 line-clamp-3 text-[11px] text-slate-500">{part.description}</p>
                      <p className="mt-1 text-xs font-semibold text-brand">{formatCurrency(part.unit_price ?? 0)}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
