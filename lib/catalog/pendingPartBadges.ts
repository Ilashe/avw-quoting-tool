// Small visual flags for parts whose downstream data isn't finalized yet (e.g. a colour/family
// choice not yet decided, or a whole part still under client review). Kept as a code-level map
// rather than a DB table since these are meant to be temporary — removed once the client
// finalizes the part, at which point it usually gets a real part_bundle_rules row instead (see
// MultiPartPicker.tsx). `tag` is the short text shown on the thumbnail's red corner badge;
// `note` is the longer explanation shown in the hover detail card.
export const PENDING_PART_BADGES: Record<string, { tag: string; note: string }> = {
  // 2026-09-05: these 5 SKUs' real descriptions say "Double Mitter Curtain" / "Dual Mini
  // Mitter" — "Double"/"Dual" is not a documented Mitter quantity modifier anywhere in the
  // spec (only Wrap has one), so guessing whether it doubles the Mitter Lookup quantity would
  // be invented logic. Flagged instead of built; remove once the client confirms the actual
  // component/quantity logic.
  'DM2-EL': { tag: 'REVIEW', note: 'Under review — "Double" quantity logic not yet confirmed' },
  'OT2-DM2': { tag: 'REVIEW', note: 'Under review — "Double" quantity logic not yet confirmed' },
  'OT2-DM2-EL': { tag: 'REVIEW', note: 'Under review — "Double" quantity logic not yet confirmed' },
  'DMM5': { tag: 'REVIEW', note: 'Under review — "Dual" quantity logic not yet confirmed' },
  'DMM5-EL': { tag: 'REVIEW', note: 'Under review — "Dual" quantity logic not yet confirmed' },
}
