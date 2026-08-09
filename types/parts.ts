export interface Part {
  part_number: string
  description: string | null
  unit_price: number | null
  is_active: boolean
}

export interface PartImage {
  part_number: string
  storage_path: string
  sort_order: number
}

export interface PartWithImage extends Part {
  image_url: string | null
}

export interface LineItem {
  id: string
  part_number: string | null // null for a manual/custom line
  description: string
  unit_price: number
  quantity: number
  image_url: string | null
}

// A part chosen via a multi_part_picker field (e.g. Robot Arch). Stored denormalized
// (like LineItem) inside selectionsStore so totals/summary don't need a DB round-trip.
export interface SelectedPart {
  part_number: string
  description: string
  unit_price: number
  image_url: string | null
  // Defaults to 1 when absent. Parts auto-added by a PartBundleRule carry that rule's quantity.
  quantity?: number
  // part_number of the trigger part that caused this row to be auto-added by a bundle rule.
  // Absent/null for a part the user picked directly.
  bundled_with?: string | null
  // The choice_label of the PartBundleRule that added this row (e.g. "Blue"), when it came
  // from a choice-group prompt rather than an always-added core row. Shown next to the row in
  // the Quote Summary so the picked option is visible without reading the full description.
  choice_label?: string | null
}

// Data-driven "when part X is picked, also add these parts" rule (any multi_part_picker,
// keyed by trigger_part_number so the same rule fires no matter which picker it's selected
// from). choice_group null = always-added "core" row. choice_group set = one of a set of
// mutually-exclusive options the user is prompted to pick between (e.g. colour).
export interface PartBundleRule {
  id: string
  trigger_part_number: string
  choice_group: string | null
  // Groups choice rows into a first-stage bucket (e.g. "Foam" vs "Drycloth") when a trigger's
  // choice needs to be resolved in two steps: pick a subgroup first, then pick a choice_label
  // within it. Null for every ordinary single-stage choice (the vast majority).
  choice_subgroup: string | null
  choice_label: string | null
  required_part_number: string
  quantity: number
  sort_order: number
}
