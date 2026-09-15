// Belt conveyor part-number generator — ported from the client-supplied reference
// (beltPartNumber.js / "Belt Part Number Nomenclature.xlsx"), adapted to this app's actual
// Conveyor section field option_values (see equipment_options for conveyor_series,
// conveyor_drive, conveyor_horsepower, conveyor_length, conveyor_steel_type,
// conveyor_belt_type).
//
// PART NUMBER SHAPE:  <seriesCode><driveCode><config> -10 <hp> - <lengthFt>
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

// Config is no longer a user-facing field — the client asked (2026-09-15) for Type of Steel
// (Stainless/Primered, mutually exclusive) and Type of Belt (Standard/Hybrid) to replace it, with
// the app deriving the Config code itself. Only the 30" series (bc_30_inches) has a known
// mapping today — matches the reference "Configuration" dropdown's 30"-width rows exactly
// (3/6/7/8; the 42"/36"/54" rows, config 4/5/10, aren't reachable since Series only offers
// bc_30_inches so far). A combination with no entry here — i.e. any future non-30" series —
// correctly blanks the whole part number, same "not yet defined" convention as SERIES_CODES.
const CONFIG_CODES_30IN: Record<string, string> = {
  'primered_steel|standard': '3',
  'stainless_steel|standard': '6',
  'primered_steel|hybrid': '7',
  'stainless_steel|hybrid': '8',
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

function parseHorsepower(value: string): number | null {
  const match = /^(\d+)hp$/.exec(value)
  return match ? Number(match[1]) : null
}

export interface ConveyorPartNumberInputs {
  series: string | null
  drive: string | null
  horsepower: string | null
  lengthFt: number | string | null
  steelType: string | null // 'stainless_steel' | 'primered_steel' | null — mutually exclusive
  beltType: string | null // 'standard' | 'hybrid' | null
}

function resolveConfig(inputs: Pick<ConveyorPartNumberInputs, 'series' | 'steelType' | 'beltType'>): string | null {
  if (inputs.series !== 'bc_30_inches' || !inputs.steelType || !inputs.beltType) return null
  return CONFIG_CODES_30IN[`${inputs.steelType}|${inputs.beltType}`] ?? null
}

/**
 * Builds the belt conveyor part number, e.g. "BCD3-1020-120". Returns null (render as blank)
 * unless series, drive, steel type, belt type, horsepower, and length are ALL set — matches
 * this app's "nothing selected means nothing shown" convention (see useApplyForcedValues).
 */
export function buildConveyorPartNumber(inputs: ConveyorPartNumberInputs): string | null {
  const seriesCode = inputs.series ? SERIES_CODES[inputs.series] : undefined
  const driveCode = inputs.drive ? DRIVE_CODES[inputs.drive] : undefined
  const config = resolveConfig(inputs)
  const hp = inputs.horsepower ? parseHorsepower(inputs.horsepower) : null
  const lengthFt = typeof inputs.lengthFt === 'number' ? inputs.lengthFt : null

  if (!seriesCode || !driveCode || !config || !hp || !lengthFt) return null

  return `${seriesCode}${driveCode}${config}${GB}${hp}-${Math.round(lengthFt)}`
}

/**
 * Fallback description formula — used ONLY when the generated part number has no exact match
 * in the real pricing export (Items.xlsx, imported into `parts`); real data always wins when it
 * exists (see SummaryPanel.tsx). Ported from the client-supplied reference file's CONCATENATE
 * formula, including its exact quirk (the "10 Series " trailing-space double-comma). The belt
 * color (client instruction, 2026-09-15) is folded into this description rather than shown as
 * its own Quote Summary row.
 * Returns null under the same required-fields gating as buildConveyorPartNumber.
 */
export function buildConveyorDescription(
  inputs: ConveyorPartNumberInputs & { colorId: string | null }
): string | null {
  const configCode = resolveConfig(inputs)
  const config = configCode ? CONFIG_TABLE[configCode] : undefined
  const driveLabel = inputs.drive ? DRIVE_DESC_LABELS[inputs.drive] : undefined
  const hp = inputs.horsepower ? parseHorsepower(inputs.horsepower) : null
  const lengthFt = typeof inputs.lengthFt === 'number' ? inputs.lengthFt : null

  if (!config || !driveLabel || !hp || !lengthFt) return null

  const colorLabel = inputs.colorId ? (COLOR_LABELS[inputs.colorId] ?? '') : ''
  return `${config.desc}, ${hp}${driveLabel}, ${Math.round(lengthFt)} Feet, ${config.frame}, Glide Plates, ${config.beltType} Polymer Belt ${colorLabel}`
}

// The Conveyor field_keys that feed the generated part number — these are suppressed as
// individual Quote Summary rows (SummaryPanel.tsx) in favor of the one combined row. Belt Color
// is included here (client instruction, 2026-09-15) even though it's cosmetic-only in the part
// number itself — it still shouldn't show as its own row, only folded into the description.
export const CONVEYOR_PART_NUMBER_FIELD_KEYS = [
  'conveyor_series',
  'conveyor_drive',
  'conveyor_steel_type',
  'conveyor_belt_type',
  'conveyor_horsepower',
  'conveyor_length',
  'belt_color',
] as const
