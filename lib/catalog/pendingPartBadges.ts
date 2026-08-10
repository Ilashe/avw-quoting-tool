// Small visual flags for parts whose downstream data isn't finalized yet (e.g. a colour/family
// choice not yet decided, or a whole part still under client review). Kept as a code-level map
// rather than a DB table since these are meant to be temporary — removed once the client
// finalizes the part, at which point it usually gets a real part_bundle_rules row instead (see
// MultiPartPicker.tsx). `tag` is the short text shown on the thumbnail's red corner badge;
// `note` is the longer explanation shown in the hover detail card.
export const PENDING_PART_BADGES: Record<string, { tag: string; note: string }> = {
  'SW2': { tag: 'TBD', note: 'Colour/material not yet decided' },
  'SW2-EL': { tag: 'TBD', note: 'Colour/material not yet decided' },
  'RB1-0122': { tag: 'REVIEW', note: 'Under review — Rocker Height not yet selected' },
  'RB1-EL-0122': { tag: 'REVIEW', note: 'Under review — Rocker Height not yet selected' },
  'OT2-WACB2': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WACB2-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WACB0405': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WACB0405-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WSW4': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WSW4-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'TB3-0325': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  '2WAMC2CB0405': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  '2WAMC2CB0405-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  '2WAMC2CB2': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  '2WAMC2CB2-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WC3CB2': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WC3CB2-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WC3CB0405': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
  'OT2-WC3CB0405-EL': { tag: 'FLAG', note: 'Flagged — bundle logic not finalized yet' },
}
