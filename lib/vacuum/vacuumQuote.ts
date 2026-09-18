import type { SelectionValue } from '@/store/selectionsStore'
import type { SelectedPart } from '@/types/parts'

/**
 * Keys the Vacuum tab writes into selectionsStore when its Next button commits a generated
 * vacuum quote.
 *
 * VACUUM_QUOTE_ITEMS_FIELD holds SelectedPart[] on purpose: lib/pricing.ts's
 * selectionsPartsTotal sums every SelectedPart[] it finds in the selections, so vacuum pricing
 * rolls into the quote total — on the client and in the server-side save — with no extra wiring.
 *
 * The tab's raw inputs (rows, central units, voltage, tool preference) round-trip through
 * VACUUM_CONFIG_FIELD as a JSON *string* rather than a nested object: SelectionValue permits
 * strings, and anything array-shaped would be mistaken for priced parts by selectionsPartsTotal.
 */
export const VACUUM_QUOTE_ITEMS_FIELD = 'vacuum_quote_items'
export const VACUUM_CONFIG_FIELD = 'vacuum_config_json'
export const VACUUM_STATS_FIELD = 'vacuum_stats_json'

export interface VacuumRow {
  id: number
  spots: number | string
}

export interface VacuumCentralUnit {
  id: number
  unit: string
  quantity: number
}

export interface VacuumConfig {
  rows: VacuumRow[]
  centralUnits: VacuumCentralUnit[]
  siteVoltage: string
  toolPreference: string
}

export interface VacuumStats {
  rows: number
  totalArches: number
  totalDrops: number
  centralUnits: string
  voltage: string
  toolPreference: string
}

export function readVacuumConfig(values: Record<string, SelectionValue>): VacuumConfig | null {
  return parseJsonField<VacuumConfig>(values[VACUUM_CONFIG_FIELD])
}

export function readVacuumStats(values: Record<string, SelectionValue>): VacuumStats | null {
  return parseJsonField<VacuumStats>(values[VACUUM_STATS_FIELD])
}

export function readVacuumItems(values: Record<string, SelectionValue>): SelectedPart[] {
  const raw = values[VACUUM_QUOTE_ITEMS_FIELD]
  return Array.isArray(raw) ? (raw as SelectedPart[]) : []
}

function parseJsonField<T>(raw: SelectionValue): T | null {
  if (typeof raw !== 'string' || raw === '') return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
