import { create } from 'zustand'
import type { SelectedPart } from '@/types/parts'

export type SelectionValue = string | number | null | SelectedPart[]

interface SelectionsState {
  values: Record<string, SelectionValue>
  /** Which quote `values` belongs to — lets the Review page reuse memory instead of refetching. */
  loadedQuoteId: string | null
  setField: (fieldKey: string, value: SelectionValue) => void
  getField: (fieldKey: string) => SelectionValue
  init: (vals: Record<string, SelectionValue>, quoteId?: string) => void
  reset: () => void
}

export const useSelectionsStore = create<SelectionsState>((set, get) => ({
  values: {},
  loadedQuoteId: null,
  setField: (fieldKey, value) =>
    set((state) => ({ values: { ...state.values, [fieldKey]: value } })),
  getField: (fieldKey) => get().values[fieldKey] ?? null,
  init: (vals, quoteId) => set({ values: { ...vals }, loadedQuoteId: quoteId ?? null }),
  reset: () => set({ values: {}, loadedQuoteId: null }),
}))
