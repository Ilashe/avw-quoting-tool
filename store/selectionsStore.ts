import { create } from 'zustand'

export type SelectionValue = string | number | null

interface SelectionsState {
  values: Record<string, SelectionValue>
  setField: (fieldKey: string, value: SelectionValue) => void
  getField: (fieldKey: string) => SelectionValue
  reset: () => void
}

export const useSelectionsStore = create<SelectionsState>((set, get) => ({
  values: {},
  setField: (fieldKey, value) =>
    set((state) => ({ values: { ...state.values, [fieldKey]: value } })),
  getField: (fieldKey) => get().values[fieldKey] ?? null,
  reset: () => set({ values: {} }),
}))
