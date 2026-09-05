// Small visual flags for parts whose downstream data isn't finalized yet (e.g. a colour/family
// choice not yet decided, or a whole part still under client review). Kept as a code-level map
// rather than a DB table since these are meant to be temporary — removed once the client
// finalizes the part, at which point it usually gets a real part_bundle_rules row instead (see
// MultiPartPicker.tsx). `tag` is the short text shown on the thumbnail's red corner badge;
// `note` is the longer explanation shown in the hover detail card.
export const PENDING_PART_BADGES: Record<string, { tag: string; note: string }> = {
  // Empty as of the Sept-2026 Equipment Options reconciliation — SW2/SW2-EL, RB1-0122/
  // RB1-EL-0122, OT2-WSW4/OT2-WSW4-EL, and TB3-0325 all got real part_bundle_rules data and had
  // their badges removed here. Add a new entry the same way when a future part genuinely needs
  // one (see the file-level comment above for the pattern).
}
