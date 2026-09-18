'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
import { useEquipmentCatalog } from '@/lib/catalog/useEquipmentCatalog'
import { useSelectionsStore } from '@/store/selectionsStore'
import {
  applyLayoutOrder,
  buildLayoutPieces,
  decodeLayoutOrder,
  encodeLayoutOrder,
  TUNNEL_LAYOUT_ORDER_FIELD,
  type LayoutPiece,
} from '@/lib/configurator/layoutFields'

export default function LayoutTab() {
  const { items, options, rules, loading, error } = useEquipmentCatalog('equipment')
  const values = useSelectionsStore((s) => s.values)
  const setField = useSelectionsStore((s) => s.setField)
  const [dragKey, setDragKey] = useState<string | null>(null)

  const pieces = useMemo(() => {
    const built = buildLayoutPieces({ values, items, options, rules })
    return applyLayoutOrder(built, decodeLayoutOrder(values[TUNNEL_LAYOUT_ORDER_FIELD]))
  }, [values, items, options, rules])

  // Persist the arrangement itself, pruned to what's currently selected so the stored string
  // doesn't accumulate keys for equipment that's since been deselected.
  function commit(next: LayoutPiece[]) {
    setField(TUNNEL_LAYOUT_ORDER_FIELD, encodeLayoutOrder(next.map((p) => p.fieldKey)))
  }

  function move(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= pieces.length || fromIndex === toIndex) return
    const next = [...pieces]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    commit(next)
  }

  if (loading) return <p className="text-sm text-slate-500">Loading layout…</p>
  if (error) return <p className="text-sm text-red-600">Couldn&apos;t load the layout: {error}</p>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">Tunnel Layout</h2>
        <p className="mt-1 text-sm text-slate-500">
          Everything selected on the Equipment tab, in wash order. Drag a piece by its number — or use
          the arrows — to move it back and forth. The arrangement saves with the quote.
        </p>
      </div>

      {pieces.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-mist px-4 py-8 text-center text-sm text-slate-500">
          Nothing to arrange yet. Make selections on the Equipment tab and they&apos;ll show up here.
        </p>
      ) : (
        <ol className="flex flex-wrap gap-3">
          {pieces.map((piece, index) => {
            const isDragging = dragKey === piece.fieldKey
            return (
              <li
                key={piece.fieldKey}
                draggable
                onDragStart={() => setDragKey(piece.fieldKey)}
                onDragEnd={() => setDragKey(null)}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (!dragKey || dragKey === piece.fieldKey) return
                  move(
                    pieces.findIndex((p) => p.fieldKey === dragKey),
                    index
                  )
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragKey(null)
                }}
                className={`flex w-56 cursor-grab flex-col rounded-xl border bg-white p-3 transition active:cursor-grabbing ${
                  isDragging ? 'border-brand opacity-50 shadow-lg' : 'border-slate-200 hover:border-brand/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                    <GripVertical className="size-3" aria-hidden="true" />
                    {index + 1}
                  </span>
                  <span className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      title="Move earlier in the tunnel"
                      aria-label={`Move ${piece.name} earlier`}
                      className="rounded p-1 text-slate-400 transition hover:bg-mist hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === pieces.length - 1}
                      title="Move later in the tunnel"
                      aria-label={`Move ${piece.name} later`}
                      className="rounded p-1 text-slate-400 transition hover:bg-mist hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{piece.name}</p>
                <p className="mt-0.5 text-xs text-slate-500" title={piece.detail}>
                  {piece.detail}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
