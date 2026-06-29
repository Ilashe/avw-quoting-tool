import { create } from 'zustand'

export type SelectionValue = string | number | null

interface SelectionsState {
  values: Record<string, SelectionValue>
  setField: (fieldKey: string, value: SelectionValue) => void
  getField: (fieldKey: string) => SelectionValue
  init: (vals: Record<string, SelectionValue>) => void
  reset: () => void
}

export const useSelectionsStore = create<SelectionsState>((set, get) => ({
  values: {},
  setField: (fieldKey, value) =>
    set((state) => ({ values: { ...state.values, [fieldKey]: value } })),
  getField: (fieldKey) => get().values[fieldKey] ?? null,
  init: (vals) => set({ values: { ...vals } }),
  reset: () => set({ values: {} }),
}))
