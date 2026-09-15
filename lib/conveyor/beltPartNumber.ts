// Belt conveyor part-number generator — ported from the client-supplied reference
// (beltPartNumber.js / "Belt Part Number Nomenclature.xlsx"), adapted to this app's actual
// Conveyor section field option_values (see equipment_options for conveyor_series,
// conveyor_drive, conveyor_config, conveyor_horsepower, conveyor_length, conveyor_steel_type).
//
// PART NUMBER SHAPE:  <seriesCode><driveCode><config> -10 <hp> - <lengthFt> [-SSPIN | -SSCS]
// Worked example: BCD3-1020-120 (Series BC, Dual drive, Config 3, gearbox -10, 20 HP, 120 ft).
//
// GB (the gearbox code) is fixed at -10 across every configuration per the client's explicit
// instruction — deliberately NOT a real input field, just baked into this formula.
const GB = -10

// Extend this map when the client adds more Series options later (each currently only has one:
// "BC - 30 inches" -> "BC"). A Series option with no entry here means "code not yet defined",
// which correctly blanks the whole generated part number rather than guessing a prefix.
const SERIES_CODES: Record<string, string> = {
  bc_30_inches: 'BC',
}

const DRIVE_CODES: Record<string, string> = {
  single: 'N', // Single Drive
  dual: 'D', // Dual Drive
}

const DRIVE_DESC_LABELS: Record<string, string> = {
  single: 'HP Drive', // glued directly onto hp with no space, e.g. "20" + "HP Drive"
  dual: 'HP Dual Drive',
}

// Config -> width/frame/belt-type, decoded from the reference sheet. `desc` is the leading
// clause of the description text — every config's desc ends in "10 Series " (trailing space
// baked in on purpose, matching the reference file's own CONCATENATE formula exactly, including
// the resulting double-space-before-comma artifact, e.g. "10 Series , 20HP Dual Drive").
const CONFIG_TABLE: Record<string, { desc: string; frame: string; beltType: string }> = {
  '3': { desc: '30" Dual Belt, includes 10 Series ', frame: 'Primered Steel Frame', beltType: 'Standard' },
  '4': { desc: '42" Dual Belt, includes 10 Series ', frame: 'Primered Steel Frame', beltType: 'Standard' },
  '5': { desc: '36" Dual Belt, includes 10 Series ', frame: 'Primered Steel Frame', beltType: 'Standard' },
  '6': { desc: '30" Dual Belt, includes 10 Series ', frame: 'Stainless Steel Frame', beltType: 'Standard' },
  '7': { desc: '30" Dual Belt, includes 10 Series ', frame: 'Primered Steel Frame', beltType: 'Hybrid' },
  '8': { desc: '30"  Dual Belt, includes 10 Series ', frame: 'Stainless Steel Frame', beltType: 'Hybrid' },
  '10': { desc: '54" Dual Belt, includes 10 Series ', frame: 'Stainless Steel Frame', beltType: 'Standard' },
}

// Belt color: cosmetic only, appears in the description as "(Blue)" etc., never in the part
// number itself. Matches this app's Belt Color field (belt_color: black/blue/red) plus yellow
// for parity with the reference file, even though Belt Color doesn't currently offer it.
const COLOR_LABELS: Record<string, string> = {
  blue: '(Blue)',
  black: '(Black)',
  red: '(Red)',
  yellow: '(Yellow)',
}

const SSPIN_LABEL = 'Stainless Steel Pins'
const SSCS_LABEL = 'Stainless Steel Takeup and Drive Only'

function parseHorsepower(value: string): number | null {
  const match = /^(\d+)hp$/.exec(value)
  return match ? Number(match[1]) : null
}

export interface ConveyorPartNumberInputs {
  series: string | null
  drive: string | null
  config: string | null
  horsepower: string | null
  lengthFt: number | string | null
  // Stainless Steel and Primered Steel are independent Yes/No toggles — either, neither, or
  // BOTH can be "yes" at once (confirmed against real priced SKUs, e.g.
  // "BCD6-1020-159-SSCS-SSPIN" exists as its own line item). Not mutually exclusive.
  stainlessSteel: string | null // 'yes' | 'no' | null
  primeredSteel: string | null // 'yes' | 'no' | null
}

/**
 * Builds the belt conveyor part number, e.g. "BCD3-1020-120" or "BCN6-1010-90-SSCS-SSPIN".
 * Returns null (render as blank) unless series, drive, config, horsepower, and length are ALL
 * set — matches this app's "nothing selected means nothing shown" convention (see
 * useApplyForcedValues). Stainless/Primered Steel are optional (suffix-only, and independent of
 * each other) — Stainless -> -SSPIN, Primered -> -SSCS, both -> -SSCS-SSPIN in that order
 * (confirmed against every real "both" SKU in the pricing export — SSCS always comes first).
 */
export function buildConveyorPartNumber(inputs: ConveyorPartNumberInputs): string | null {
  const seriesCode = inputs.series ? SERIES_CODES[inputs.series] : undefined
  const driveCode = inputs.drive ? DRIVE_CODES[inputs.drive] : undefined
  const config = inputs.config ? Number(inputs.config) : null
  const hp = inputs.horsepower ? parseHorsepower(inputs.horsepower) : null
  const lengthFt = typeof inputs.lengthFt === 'number' ? inputs.lengthFt : null

  if (!seriesCode || !driveCode || !config || !hp || !lengthFt) return null

  let partNumber = `${seriesCode}${driveCode}${config}${GB}${hp}-${Math.round(lengthFt)}`
  if (inputs.primeredSteel === 'yes') partNumber += '-SSCS'
  if (inputs.stainlessSteel === 'yes') partNumber += '-SSPIN'
  return partNumber
}

/**
 * Fallback description formula — used ONLY when the generated part number has no exact match
 * in the real pricing export (Items.xlsx, imported into `parts`); real data always wins when it
 * exists (see SummaryPanel.tsx). Ported from the client-supplied reference file's
 * CONCATENATE formula, including its exact quirks (the "10 Series " trailing-space double-comma,
 * SSPIN appended before SSCS here — the reference file gives the description this order
 * deliberately, even though the PART NUMBER suffix order is SSCS-then-SSPIN; the two are
 * independent formulas, not required to match).
 * Returns null under the same required-fields gating as buildConveyorPartNumber.
 */
export function buildConveyorDescription(
  inputs: ConveyorPartNumberInputs & { colorId: string | null }
): string | null {
  const config = inputs.config ? CONFIG_TABLE[inputs.config] : undefined
  const driveLabel = inputs.drive ? DRIVE_DESC_LABELS[inputs.drive] : undefined
  const hp = inputs.horsepower ? parseHorsepower(inputs.horsepower) : null
  const lengthFt = typeof inputs.lengthFt === 'number' ? inputs.lengthFt : null

  if (!config || !driveLabel || !hp || !lengthFt) return null

  const colorLabel = inputs.colorId ? (COLOR_LABELS[inputs.colorId] ?? '') : ''
  let s = `${config.desc}, ${hp}${driveLabel}, ${Math.round(lengthFt)} Feet, ${config.frame}, Glide Plates, ${config.beltType} Polymer Belt ${colorLabel}`
  if (inputs.stainlessSteel === 'yes') s += `, ${SSPIN_LABEL}`
  if (inputs.primeredSteel === 'yes') s += `, ${SSCS_LABEL}`
  return s
}

// The 7 Conveyor field_keys that feed the generated part number — these are suppressed as
// individual Quote Summary rows (SummaryPanel.tsx) in favor of the one combined row.
export const CONVEYOR_PART_NUMBER_FIELD_KEYS = [
  'conveyor_series',
  'conveyor_drive',
  'conveyor_config',
  'conveyor_horsepower',
  'conveyor_length',
  'conveyor_stainless_steel',
  'conveyor_primered_steel',
] as const
