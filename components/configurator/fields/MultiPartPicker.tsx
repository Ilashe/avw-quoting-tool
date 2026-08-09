'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { usePartsByNumbers } from '@/lib/catalog/usePartsByNumbers'
import { usePartBundleRules } from '@/lib/catalog/usePartBundleRules'
import { PENDING_PART_BADGES } from '@/lib/catalog/pendingPartBadges'
import { formatCurrency } from '@/lib/format'
import type { EquipmentOption } from '@/types/equipment'
import type { PartBundleRule, SelectedPart } from '@/types/parts'

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
  const { rules: bundleRules } = usePartBundleRules(partNumbers)
  const bundleRequiredNumbers = [...new Set(bundleRules.map((r) => r.required_part_number))]
  const allNumbers = [...new Set([...partNumbers, ...bundleRequiredNumbers])]
  const { parts: fetchedParts, loading, error } = usePartsByNumbers(allNumbers)
  const partsByNumber = new Map(fetchedParts.map((p) => [p.part_number, p]))

  // Supabase's `.in()` filter doesn't preserve argument order, so re-sort to match the
  // curated equipment_options sort_order (partNumbers is already in that order). Only the
  // picker's own options render as thumbnails — bundle-required parts are fetched for their
  // description/price/image but never shown as a pickable tile themselves.
  const orderIndex = new Map(partNumbers.map((pn, i) => [pn, i]))
  const parts = fetchedParts
    .filter((p) => orderIndex.has(p.part_number))
    .sort((a, b) => (orderIndex.get(a.part_number) ?? 0) - (orderIndex.get(b.part_number) ?? 0))

  const selected = value ?? []
  const selectedNumbers = new Set(selected.map((p) => p.part_number))
  const [hovered, setHovered] = useState<{ partNumber: string; top: number; left: number } | null>(null)

  const [pendingChoice, setPendingChoice] = useState<{
    part: SelectedPart
    coreRules: PartBundleRule[]
    choiceGroup: string
    choiceOptions: PartBundleRule[]
  } | null>(null)

  // Some triggers need a two-stage prompt: pick a material/subgroup first (e.g. "Foam" vs
  // "Drycloth"), then pick a colour within that subgroup. Populated when a trigger's choice
  // rules span more than one distinct choice_subgroup; resolves into pendingChoice once a
  // subgroup is picked (see chooseMaterial).
  const [pendingMaterial, setPendingMaterial] = useState<{
    part: SelectedPart
    coreRules: PartBundleRule[]
    choiceRules: PartBundleRule[]
    subgroups: string[]
  } | null>(null)

  function buildBundledPart(rule: PartBundleRule, triggerPartNumber: string): SelectedPart {
    const p = partsByNumber.get(rule.required_part_number)
    return {
      part_number: rule.required_part_number,
      description: p?.description ?? rule.required_part_number,
      unit_price: p?.unit_price ?? 0,
      image_url: p?.image_url ?? null,
      quantity: rule.quantity,
      bundled_with: triggerPartNumber,
      choice_label: rule.choice_label,
    }
  }

  function toggle(part: SelectedPart) {
    if (selectedNumbers.has(part.part_number)) {
      // Deselecting the trigger also removes anything a bundle rule auto-added for it.
      onChange(selected.filter((p) => p.part_number !== part.part_number && p.bundled_with !== part.part_number))
      return
    }

    const rulesForPart = bundleRules.filter((r) => r.trigger_part_number === part.part_number)
    const coreRules = rulesForPart.filter((r) => !r.choice_group)
    const choiceRules = rulesForPart.filter((r) => r.choice_group)

    if (choiceRules.length === 0) {
      const additions = coreRules.map((r) => buildBundledPart(r, part.part_number))
      onChange([...selected, part, ...additions])
      return
    }

    // A trigger whose choice rules span more than one choice_subgroup (e.g. "Foam" vs
    // "Drycloth") needs the subgroup resolved first, before the actual colour prompt.
    const subgroups = [...new Set(choiceRules.map((r) => r.choice_subgroup).filter((s): s is string => !!s))]
    if (subgroups.length > 1) {
      setPendingMaterial({ part, coreRules, choiceRules, subgroups })
      return
    }

    // Only one choice group supported per trigger part for now — prompt for the first.
    const choiceGroups = [...new Set(choiceRules.map((r) => r.choice_group as string))]
    setPendingChoice({
      part,
      coreRules,
      choiceGroup: choiceGroups[0],
      choiceOptions: choiceRules.filter((r) => r.choice_group === choiceGroups[0]),
    })
  }

  function chooseMaterial(subgroup: string) {
    if (!pendingMaterial) return
    const filtered = pendingMaterial.choiceRules.filter((r) => r.choice_subgroup === subgroup)
    const choiceGroups = [...new Set(filtered.map((r) => r.choice_group as string))]
    setPendingChoice({
      part: pendingMaterial.part,
      coreRules: pendingMaterial.coreRules,
      choiceGroup: choiceGroups[0],
      choiceOptions: filtered,
    })
    setPendingMaterial(null)
  }

  function confirmChoice(chosenRule: PartBundleRule) {
    if (!pendingChoice) return
    const additions = [...pendingChoice.coreRules, chosenRule].map((r) =>
      buildBundledPart(r, pendingChoice.part.part_number)
    )
    onChange([...selected, pendingChoice.part, ...additions])
    setPendingChoice(null)
  }

  // Card is a fixed 192px (w-48) wide, roughly 230px tall (image + text + padding). Positioned
  // via viewport-relative fixed coordinates (not CSS centering on the thumbnail) so it can be
  // clamped to stay fully on-screen both vertically (flip above if no room below) and
  // horizontally (a thumbnail near the left/right edge of the grid — e.g. the first item in
  // every row — would otherwise have the centered card spill off the edge of the page).
  const CARD_WIDTH = 192
  const CARD_HEIGHT_ESTIMATE = 230
  const VIEWPORT_MARGIN = 8
  function handleEnter(e: React.MouseEvent<HTMLDivElement>, partNumber: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const top =
      spaceBelow < CARD_HEIGHT_ESTIMATE
        ? rect.top - CARD_HEIGHT_ESTIMATE - VIEWPORT_MARGIN
        : rect.bottom + VIEWPORT_MARGIN
    const idealLeft = rect.left + rect.width / 2 - CARD_WIDTH / 2
    const left = Math.min(
      Math.max(idealLeft, VIEWPORT_MARGIN),
      window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN
    )
    setHovered({ partNumber, top, left })
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
              const pendingBadge = PENDING_PART_BADGES[part.part_number]
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
                    {pendingBadge && (
                      <span className="absolute left-0 top-0 rounded-br bg-red-600 px-1 py-0.5 text-[8px] font-bold leading-none text-white">
                        {pendingBadge.tag}
                      </span>
                    )}
                  </button>

                  {/* Hover detail card — only mounted while actually hovered (not just
                      opacity-toggled), so we're not loading 26 preview images at once.
                      Fixed-positioned at viewport-relative coordinates computed in handleEnter,
                      which clamps both axes to stay fully on-screen — flips above the thumbnail
                      if there isn't room below, and shifts off pure centering if the thumbnail
                      is near the left/right edge (e.g. the first item in every row). */}
                  {isHovered && hovered && (
                    <div
                      style={{ top: hovered.top, left: hovered.left, width: CARD_WIDTH }}
                      className="pointer-events-none fixed z-30 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
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
                      {pendingBadge && (
                        <p className="mt-1 text-[10px] font-semibold text-red-600">{pendingBadge.note}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {pendingMaterial && (
        <MaterialChoiceModal
          options={pendingMaterial.subgroups}
          onChoose={chooseMaterial}
          onCancel={() => setPendingMaterial(null)}
        />
      )}

      {pendingChoice && (
        <BundleChoiceModal
          choiceGroup={pendingChoice.choiceGroup}
          options={pendingChoice.choiceOptions}
          onChoose={confirmChoice}
          onCancel={() => setPendingChoice(null)}
        />
      )}
    </div>
  )
}

// When a choice option's label names a colour, hover it in that colour instead of the
// generic brand highlight — falls back to the brand style for any label that isn't one of
// these (e.g. a future non-colour choice group like size).
const COLOUR_HOVER_CLASSES: Record<string, string> = {
  black: 'hover:border-slate-900 hover:bg-slate-900 hover:text-white',
  blue: 'hover:border-blue-600 hover:bg-blue-600 hover:text-white',
  red: 'hover:border-red-600 hover:bg-red-600 hover:text-white',
  grey: 'hover:border-slate-500 hover:bg-slate-500 hover:text-white',
}

function choiceHoverClasses(label: string | null): string {
  const key = label?.trim().toLowerCase() ?? ''
  return COLOUR_HOVER_CLASSES[key] ?? 'hover:border-brand hover:bg-mist'
}

// First stage of a two-stage bundle choice (e.g. "Foam" vs "Drycloth") — resolves into a
// second BundleChoiceModal scoped to whichever subgroup was picked (see chooseMaterial).
function MaterialChoiceModal({
  options,
  onChoose,
  onCancel,
}: {
  options: string[]
  onChoose: (subgroup: string) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl">
        <p className="text-sm font-semibold text-ink">Choose a material</p>
        <div className="mt-3 flex gap-2">
          {options.map((subgroup) => (
            <button
              key={subgroup}
              type="button"
              onClick={() => onChoose(subgroup)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-ink transition hover:border-brand hover:bg-mist"
            >
              {subgroup}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-mist"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function BundleChoiceModal({
  choiceGroup,
  options,
  onChoose,
  onCancel,
}: {
  choiceGroup: string
  options: PartBundleRule[]
  onChoose: (rule: PartBundleRule) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl">
        {/* choiceGroup is the full header text as stored on the rule (e.g. "NEOGLIDE colour"
            or "Upper Contour(NEOGLIDE)") — no fixed "Choose a ..." template, so each rule can
            phrase its own prompt without a code change. */}
        <p className="text-sm font-semibold text-ink">{choiceGroup}</p>
        <div className="mt-3 flex gap-2">
          {options.map((rule) => (
            <button
              key={rule.id}
              type="button"
              onClick={() => onChoose(rule)}
              className={`flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-ink transition ${choiceHoverClasses(rule.choice_label)}`}
            >
              {rule.choice_label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-mist"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
