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

// choice_subgroup doubles as "Category:Material" when a trigger needs a third prompt stage
// ahead of material (e.g. "Wrap" vs "Mitter curtain", each with its own different materials).
// Plain subgroups (the vast majority — no colon) parse as material-only, family null.
//
// This is a genuinely EXCLUSIVE pick (choose ONE category, e.g. Rocker's Height) — distinct
// from the additive `component` queue below, which asks about EVERY component, never a choice.
function parseSubgroup(subgroup: string | null): { family: string | null; material: string | null } {
  if (!subgroup) return { family: null, material: null }
  const idx = subgroup.indexOf(':')
  if (idx === -1) return { family: null, material: subgroup }
  return { family: subgroup.slice(0, idx), material: subgroup.slice(idx + 1) }
}

type ComponentStage = { component: string; choiceRules: PartBundleRule[] }

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
    // Present only for a standalone (non-queue) trigger's finalize — omitted while resolving a
    // component-queue stage, where pendingComponentQueue itself owns the trigger part/cores.
    part?: SelectedPart
    coreRules: PartBundleRule[]
    // Non-null only inside a component-queue stage — drives the "<component> colour" heading
    // and prefixes the resulting SelectedPart's choice_label (e.g. "Wrap — Black") so two
    // components' rows are distinguishable in the Quote Summary. Null for every ordinary
    // single-component trigger, which keeps today's plain choiceGroup-text heading.
    component: string | null
    choiceGroup: string
    choiceOptions: PartBundleRule[]
  } | null>(null)

  // Some triggers need a two-stage prompt: pick a material/subgroup first (e.g. "Foam" vs
  // "Drycloth"), then pick a colour within that subgroup. Populated when a trigger's (or a
  // component stage's) choice rules span more than one distinct choice_subgroup; resolves into
  // pendingChoice once a subgroup is picked (see chooseMaterial).
  const [pendingMaterial, setPendingMaterial] = useState<{
    part?: SelectedPart
    coreRules: PartBundleRule[]
    component: string | null
    choiceRules: PartBundleRule[]
    subgroups: string[]
  } | null>(null)

  // A few triggers need a THIRD stage ahead of material: pick a category first (e.g. "Wrap" vs
  // "Mitter curtain"), where each category has its own different set of materials. Encoded as a
  // "Category:Material" compound value in choice_subgroup (see parseSubgroup) rather than a new
  // DB column. This is an EXCLUSIVE pick (e.g. Rocker's Height) — never combined with the
  // additive component queue below (no live trigger uses both mechanisms at once).
  const [pendingFamily, setPendingFamily] = useState<{
    part: SelectedPart
    coreRules: PartBundleRule[]
    choiceRules: PartBundleRule[]
    families: string[]
  } | null>(null)

  // Additive queue: when a trigger's choice rules span 2+ distinct `component` values (e.g. a
  // combo's separate Wrap and Mitter questions), EVERY component must be resolved in turn —
  // never an exclusive pick, unlike pendingFamily above. `resolved` accumulates each finished
  // component's parts; `coreRules` (the trigger's own always-added cores) are added exactly
  // once, when the last component finishes (see advanceQueue).
  const [pendingComponentQueue, setPendingComponentQueue] = useState<{
    part: SelectedPart
    coreRules: PartBundleRule[]
    queue: ComponentStage[]
    resolved: SelectedPart[]
  } | null>(null)

  type ColorChoiceArgs = {
    part?: SelectedPart
    coreRules: PartBundleRule[]
    component: string | null
    choiceGroup: string
    choiceOptions: PartBundleRule[]
  }

  // Mitter's (and Mini Mitter's) colour rows carry allow_two_color_split — asked "one colour or
  // two?" before the ordinary single-select colour modal. Every other trigger's colour rows
  // have this false, so pendingColorCount/pendingTwoColorPick are simply never used for them.
  const [pendingColorCount, setPendingColorCount] = useState<ColorChoiceArgs | null>(null)
  const [pendingTwoColorPick, setPendingTwoColorPick] = useState<ColorChoiceArgs | null>(null)

  // Wrap and Side Washer mix plain single colours (Black/Blue/Red) with two-colour pattern
  // labels (e.g. "Blue Top / Black Bottom", "Black + Blue Alternating") under one material's
  // choice rules. Rather than dumping all ~9 buttons in one list, ask "One Color or Two Color?"
  // first and show only the matching subset — this is a filter on which EXISTING rows to show
  // (still exactly one required part picked), unlike Mitter's allow_two_color_split (which
  // splits ONE row's quantity across two picks). The single-colour vocabulary is fixed across
  // every lookup table in the spec, so detecting it by label text (not a DB column) is safe.
  const SINGLE_COLOR_LABELS = new Set(['Black', 'Blue', 'Red'])
  const [pendingColorMode, setPendingColorMode] = useState<ColorChoiceArgs | null>(null)

  function openColorChoice(args: ColorChoiceArgs) {
    if (args.choiceOptions[0]?.allow_two_color_split) {
      setPendingColorCount(args)
      return
    }
    const labels = new Set(args.choiceOptions.map((r) => r.choice_label as string))
    const hasSingle = [...labels].some((l) => SINGLE_COLOR_LABELS.has(l))
    const hasPattern = [...labels].some((l) => !SINGLE_COLOR_LABELS.has(l))
    if (hasSingle && hasPattern) {
      setPendingColorMode(args)
      return
    }
    setPendingChoice(args)
  }

  function chooseColorMode(mode: 'One Color' | 'Two Color') {
    if (!pendingColorMode) return
    const filtered = pendingColorMode.choiceOptions.filter((r) =>
      mode === 'One Color' ? SINGLE_COLOR_LABELS.has(r.choice_label as string) : !SINGLE_COLOR_LABELS.has(r.choice_label as string)
    )
    setPendingChoice({ ...pendingColorMode, choiceOptions: filtered })
    setPendingColorMode(null)
  }

  function buildBundledPart(rule: PartBundleRule, triggerPartNumber: string, labelPrefix?: string): SelectedPart {
    const p = partsByNumber.get(rule.required_part_number)
    const choiceLabel = rule.choice_label
      ? labelPrefix
        ? `${labelPrefix} — ${rule.choice_label}`
        : rule.choice_label
      : null
    return {
      part_number: rule.required_part_number,
      description: p?.description ?? rule.required_part_number,
      unit_price: p?.unit_price ?? 0,
      image_url: p?.image_url ?? null,
      quantity: rule.quantity,
      bundled_with: triggerPartNumber,
      choice_label: choiceLabel,
    }
  }

  // Opens the material or colour prompt for one component-queue stage. Never opens the
  // exclusive "choose a category" modal — every stage in the queue always gets asked.
  function openComponentStage(stage: ComponentStage) {
    const subgroups = [
      ...new Set(stage.choiceRules.map((r) => r.choice_subgroup).filter((s): s is string => !!s)),
    ]
    if (subgroups.length > 1) {
      setPendingMaterial({ coreRules: [], component: stage.component, choiceRules: stage.choiceRules, subgroups })
      return
    }
    const choiceGroups = [...new Set(stage.choiceRules.map((r) => r.choice_group as string))]
    openColorChoice({
      coreRules: [],
      component: stage.component,
      choiceGroup: choiceGroups[0],
      choiceOptions: stage.choiceRules,
    })
  }

  // Called once a component stage's colour is confirmed. Advances to the next queued
  // component, or — once the queue is empty — adds the trigger part, its own core rules
  // (added exactly once here, not per-stage), and every stage's accumulated parts together.
  function advanceQueue(additionsFromThisStage: SelectedPart[]) {
    if (!pendingComponentQueue) return
    const resolved = [...pendingComponentQueue.resolved, ...additionsFromThisStage]
    const [next, ...rest] = pendingComponentQueue.queue

    if (!next) {
      const coreParts = pendingComponentQueue.coreRules.map((r) =>
        buildBundledPart(r, pendingComponentQueue.part.part_number)
      )
      onChange([...selected, pendingComponentQueue.part, ...coreParts, ...resolved])
      setPendingComponentQueue(null)
      return
    }

    setPendingComponentQueue({ ...pendingComponentQueue, queue: rest, resolved })
    openComponentStage(next)
  }

  function cancelAll() {
    setPendingFamily(null)
    setPendingMaterial(null)
    setPendingChoice(null)
    setPendingColorCount(null)
    setPendingTwoColorPick(null)
    setPendingColorMode(null)
    setPendingComponentQueue(null)
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

    // A trigger whose choice rules span more than one `component` (e.g. a combo's separate
    // Wrap and Mitter questions) must resolve EVERY component in turn — an additive queue,
    // never an exclusive pick.
    const components = [
      ...new Set(choiceRules.map((r) => r.component).filter((c): c is string => !!c)),
    ]
    if (components.length > 1) {
      const queue: ComponentStage[] = components.map((component) => ({
        component,
        choiceRules: choiceRules.filter((r) => r.component === component),
      }))
      const [first, ...rest] = queue
      setPendingComponentQueue({ part, coreRules, queue: rest, resolved: [] })
      openComponentStage(first)
      return
    }

    // A trigger whose choice rules span more than one category (e.g. "Wrap" vs "Mitter
    // curtain", each with its own materials) needs the category resolved first — an EXCLUSIVE
    // pick (e.g. Rocker's Height), distinct from the additive component queue above.
    const families = [
      ...new Set(choiceRules.map((r) => parseSubgroup(r.choice_subgroup).family).filter((f): f is string => !!f)),
    ]
    if (families.length > 1) {
      setPendingFamily({ part, coreRules, choiceRules, families })
      return
    }

    // A trigger whose choice rules span more than one material (e.g. "Foam" vs "Drycloth")
    // needs the material resolved first, before the actual colour prompt.
    const subgroups = [
      ...new Set(
        choiceRules
          .map((r) => {
            const parsed = parseSubgroup(r.choice_subgroup)
            return parsed.family ? parsed.material : r.choice_subgroup
          })
          .filter((s): s is string => !!s)
      ),
    ]
    if (subgroups.length > 1) {
      setPendingMaterial({ part, coreRules, component: null, choiceRules, subgroups })
      return
    }

    // Only one choice group — prompt for it directly.
    const choiceGroups = [...new Set(choiceRules.map((r) => r.choice_group as string))]
    openColorChoice({
      part,
      coreRules,
      component: null,
      choiceGroup: choiceGroups[0],
      choiceOptions: choiceRules.filter((r) => r.choice_group === choiceGroups[0]),
    })
  }

  function chooseFamily(family: string) {
    if (!pendingFamily) return
    const filtered = pendingFamily.choiceRules.filter((r) => parseSubgroup(r.choice_subgroup).family === family)
    const materials = [
      ...new Set(filtered.map((r) => parseSubgroup(r.choice_subgroup).material).filter((m): m is string => !!m)),
    ]
    if (materials.length > 1) {
      setPendingMaterial({
        part: pendingFamily.part,
        coreRules: pendingFamily.coreRules,
        component: null,
        choiceRules: filtered,
        subgroups: materials,
      })
    } else {
      const choiceGroups = [...new Set(filtered.map((r) => r.choice_group as string))]
      openColorChoice({
        part: pendingFamily.part,
        coreRules: pendingFamily.coreRules,
        component: null,
        choiceGroup: choiceGroups[0],
        choiceOptions: filtered,
      })
    }
    setPendingFamily(null)
  }

  function chooseMaterial(subgroup: string) {
    if (!pendingMaterial) return
    const filtered = pendingMaterial.choiceRules.filter((r) => {
      const parsed = parseSubgroup(r.choice_subgroup)
      return (parsed.family ? parsed.material : r.choice_subgroup) === subgroup
    })
    const choiceGroups = [...new Set(filtered.map((r) => r.choice_group as string))]
    openColorChoice({
      part: pendingMaterial.part,
      coreRules: pendingMaterial.coreRules,
      component: pendingMaterial.component,
      choiceGroup: choiceGroups[0],
      choiceOptions: filtered,
    })
    setPendingMaterial(null)
  }

  function confirmChoice(chosenLabel: string) {
    if (!pendingChoice) return
    // A single colour choice can resolve to more than one required part (e.g. CB0405's
    // "Black" adds both the lower-contour AND upper-contour brush) — every rule row sharing
    // this choice_group + choice_label gets added together, not just one.
    const chosenRules = pendingChoice.choiceOptions.filter((r) => r.choice_label === chosenLabel)
    const triggerPartNumber = pendingChoice.part?.part_number ?? pendingComponentQueue?.part.part_number
    if (!triggerPartNumber) return
    const additions = [...pendingChoice.coreRules, ...chosenRules].map((r) =>
      buildBundledPart(r, triggerPartNumber, pendingChoice.component ?? undefined)
    )

    if (pendingComponentQueue) {
      setPendingChoice(null)
      advanceQueue(additions)
      return
    }

    onChange([...selected, pendingChoice.part!, ...additions])
    setPendingChoice(null)
  }

  // Splits the row's stored quantity roughly in half across two picked colours — the
  // first-picked colour gets the extra piece on an odd total (spec doesn't mandate a
  // tie-break, so this is a documented, deterministic choice). Only reachable for rows with
  // allow_two_color_split (Mitter/Mini Mitter) via pendingColorCount's "Two colours" branch.
  function confirmTwoColorChoice(labels: [string, string]) {
    if (!pendingTwoColorPick) return
    const [firstLabel, secondLabel] = labels
    const firstRules = pendingTwoColorPick.choiceOptions.filter((r) => r.choice_label === firstLabel)
    const secondRules = pendingTwoColorPick.choiceOptions.filter((r) => r.choice_label === secondLabel)
    const fullQty = firstRules[0]?.quantity ?? 0
    const firstQty = Math.ceil(fullQty / 2)
    const secondQty = Math.floor(fullQty / 2)

    const triggerPartNumber = pendingTwoColorPick.part?.part_number ?? pendingComponentQueue?.part.part_number
    if (!triggerPartNumber) return

    const labelPrefix = pendingTwoColorPick.component ?? undefined
    const additions = [
      ...pendingTwoColorPick.coreRules.map((r) => buildBundledPart(r, triggerPartNumber, labelPrefix)),
      ...firstRules.map((r) => buildBundledPart({ ...r, quantity: firstQty }, triggerPartNumber, labelPrefix)),
      ...secondRules.map((r) => buildBundledPart({ ...r, quantity: secondQty }, triggerPartNumber, labelPrefix)),
    ]

    if (pendingComponentQueue) {
      setPendingTwoColorPick(null)
      advanceQueue(additions)
      return
    }

    onChange([...selected, pendingTwoColorPick.part!, ...additions])
    setPendingTwoColorPick(null)
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

      {pendingFamily && (
        <MaterialChoiceModal
          heading="Choose a category"
          options={pendingFamily.families}
          onChoose={chooseFamily}
          onCancel={cancelAll}
        />
      )}

      {pendingMaterial && (
        <MaterialChoiceModal
          heading={pendingMaterial.component ? `${pendingMaterial.component} material` : undefined}
          options={pendingMaterial.subgroups}
          onChoose={chooseMaterial}
          onCancel={cancelAll}
        />
      )}

      {pendingColorMode && (
        <MaterialChoiceModal
          heading="One Color or Two Color?"
          options={['One Color', 'Two Color']}
          onChoose={(mode) => chooseColorMode(mode as 'One Color' | 'Two Color')}
          onCancel={cancelAll}
        />
      )}

      {pendingChoice && (
        <BundleChoiceModal
          choiceGroup={pendingChoice.component ? `${pendingChoice.component} color` : pendingChoice.choiceGroup}
          options={pendingChoice.choiceOptions}
          onChoose={confirmChoice}
          onCancel={cancelAll}
        />
      )}

      {pendingColorCount && (
        <MaterialChoiceModal
          heading="One color or two?"
          options={['One color', 'Two colors']}
          onChoose={(choice) => {
            const args = pendingColorCount
            setPendingColorCount(null)
            if (choice === 'Two colors') setPendingTwoColorPick(args)
            else setPendingChoice(args)
          }}
          onCancel={cancelAll}
        />
      )}

      {pendingTwoColorPick && (
        <TwoColorPickModal
          choiceGroup={
            pendingTwoColorPick.component ? `${pendingTwoColorPick.component} colors` : pendingTwoColorPick.choiceGroup
          }
          options={pendingTwoColorPick.choiceOptions}
          onConfirm={confirmTwoColorChoice}
          onCancel={cancelAll}
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
  heading = 'Choose a material',
  options,
  onChoose,
  onCancel,
}: {
  heading?: string
  options: string[]
  onChoose: (subgroup: string) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl">
        <p className="text-sm font-semibold text-ink">{heading}</p>
        <div className="mt-3 flex flex-wrap gap-2">
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
  onChoose: (label: string) => void
  onCancel: () => void
}) {
  // Multiple rule rows can share the same choice_label (e.g. CB0405's "Black" covers both the
  // lower-contour and upper-contour brush parts) — render one button per unique label, in
  // sort_order, and let confirmChoice resolve every matching row when it's picked.
  const uniqueLabels = [...new Set(options.map((r) => r.choice_label as string))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl">
        {/* choiceGroup is the full header text (either a component-aware "<Component> colour"
            string, or the row's own literal choiceGroup text for ordinary single-component
            triggers) — no fixed "Choose a ..." template, so each case can phrase its own
            prompt without a code change. */}
        <p className="text-sm font-semibold text-ink">{choiceGroup}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {uniqueLabels.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onChoose(label)}
              className={`flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-ink transition ${choiceHoverClasses(label)}`}
            >
              {label}
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

// Reached only from pendingColorCount's "Two colours" branch (rows with allow_two_color_split,
// i.e. Mitter/Mini Mitter) — checkbox-style pick of EXACTLY two colours, whose combined
// quantity gets split roughly in half by confirmTwoColorChoice.
function TwoColorPickModal({
  choiceGroup,
  options,
  onConfirm,
  onCancel,
}: {
  choiceGroup: string
  options: PartBundleRule[]
  onConfirm: (labels: [string, string]) => void
  onCancel: () => void
}) {
  const uniqueLabels = [...new Set(options.map((r) => r.choice_label as string))]
  const [picked, setPicked] = useState<string[]>([])

  function toggleLabel(label: string) {
    setPicked((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label)
      if (prev.length >= 2) return prev
      return [...prev, label]
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-xl bg-white p-5 shadow-xl">
        <p className="text-sm font-semibold text-ink">{choiceGroup}</p>
        <p className="mt-0.5 text-xs text-slate-400">Pick exactly two colors — quantity splits between them.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {uniqueLabels.map((label) => {
            const isPicked = picked.includes(label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleLabel(label)}
                className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition ${
                  isPicked ? 'border-brand bg-mist text-ink' : 'border-slate-200 text-ink hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          disabled={picked.length !== 2}
          onClick={() => onConfirm(picked as [string, string])}
          className="mt-3 w-full rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-mist"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
