// Blower part-number generator — HP class (blower_hp_class) × Nozzle Orientation
// (blower_nozzle_orientation) × Rotation (blower_rotation) × Housing Color (blower_color) select
// one exact real part number/price (Items export, confirmed 2026-09-23), e.g.
// 10 HP + Angled + Clockwise + Blue -> BL0522DFA-10-B ($5,367). The four inputs compose the part
// number regularly (nozzle -> FA/FS, color -> B/K/R, rotation -> plain/-CCW suffix), so this is a
// small formula rather than a 24-row table — same "required fields all-or-nothing" convention as
// buildConveyorPartNumber (see lib/conveyor/beltPartNumber.ts): any input missing returns null.

const NOZZLE_CODES: Record<string, string> = {
  angled: 'FA',
  straight: 'FS',
}

const NOZZLE_LABELS: Record<string, string> = {
  angled: 'Angled',
  straight: 'Straight',
}

const COLOR_CODES: Record<string, string> = {
  black: 'K',
  blue: 'B',
  red: 'R',
}

const COLOR_LABELS: Record<string, string> = {
  black: 'BLACK',
  blue: 'BLUE',
  red: 'RED',
}

const ROTATION_SUFFIXES: Record<string, string> = {
  cw: '',
  ccw: '-CCW',
}

const ROTATION_LABELS: Record<string, string> = {
  cw: 'Clockwise',
  ccw: 'Counterclockwise',
}

const HP_PRICES: Record<string, number> = {
  '10hp': 5367,
  '15hp': 5617,
}

const HP_NUMBERS: Record<string, string> = {
  '10hp': '10',
  '15hp': '15',
}

export interface BlowerPartNumberInputs {
  hpClass: string | null // '10hp' | '15hp'
  nozzle: string | null // 'angled' | 'straight'
  rotation: string | null // 'cw' | 'ccw'
  color: string | null // 'black' | 'blue' | 'red'
}

export interface BlowerPart {
  partNumber: string
  description: string
  price: number
}

/** Pulls the blower part-number inputs out of a quote's flat field_key -> value selections map. */
export function blowerInputsFromSelections(values: Record<string, unknown>): BlowerPartNumberInputs {
  return {
    hpClass: (values['blower_hp_class'] as string) ?? null,
    nozzle: (values['blower_nozzle_orientation'] as string) ?? null,
    rotation: (values['blower_rotation'] as string) ?? null,
    color: (values['blower_color'] as string) ?? null,
  }
}

/**
 * Builds the real blower part number/description/price, e.g. "BL0522DFA-10-B". Returns null
 * unless HP class, nozzle orientation, rotation, and housing color are ALL set.
 */
export function buildBlowerPart(inputs: BlowerPartNumberInputs): BlowerPart | null {
  const { hpClass, nozzle, rotation, color } = inputs
  const nozzleCode = nozzle ? NOZZLE_CODES[nozzle] : undefined
  const colorCode = color ? COLOR_CODES[color] : undefined
  const rotationSuffix = rotation ? ROTATION_SUFFIXES[rotation] : undefined
  const hpNumber = hpClass ? HP_NUMBERS[hpClass] : undefined
  const price = hpClass ? HP_PRICES[hpClass] : undefined

  if (!nozzleCode || !colorCode || rotationSuffix === undefined || !hpNumber || !price) return null

  const partNumber = `BL0522D${nozzleCode}-${hpNumber}-${colorCode}${rotationSuffix}`
  const description =
    `Blower Producer, ${hpNumber} HP 3600 RPM, Reinforced Flanged Plastic Housing, ` +
    `Reinforced Flanged ${NOZZLE_LABELS[nozzle as string]} Nozzle, 15HP Intake Screen, includes ` +
    `U-Bolts, ${COLOR_LABELS[color as string]} Housing, ${ROTATION_LABELS[rotation as string]} Rotation`

  return { partNumber, description, price }
}

// The Blower fields that feed the generated part number — suppressed as individual Quote Summary
// rows in favor of the one combined row (same pattern as CONVEYOR_PART_NUMBER_FIELD_KEYS).
export const BLOWER_PART_NUMBER_FIELD_KEYS = [
  'blower_hp_class',
  'blower_nozzle_orientation',
  'blower_rotation',
  'blower_color',
  'number_of_blowers',
] as const
