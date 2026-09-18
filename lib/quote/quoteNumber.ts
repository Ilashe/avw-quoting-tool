/** The sequential number from migration 0069, or a stable id-derived stand-in without it. */
export function formatQuoteNumber(quoteNumber: unknown, quoteId: string): string {
  if (typeof quoteNumber === 'number') return String(quoteNumber)
  const hex = quoteId.replace(/-/g, '').slice(-6)
  return String(100000 + (parseInt(hex, 16) % 900000))
}
