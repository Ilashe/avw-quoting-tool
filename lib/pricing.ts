import type { LineItem } from '@/types/parts'

export function computeQuoteTotal(lineItems: LineItem[], discountPercent: number | null | undefined): number {
  const subtotal = lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const pct = discountPercent ?? 0
  return Math.max(0, subtotal * (1 - pct / 100))
}
