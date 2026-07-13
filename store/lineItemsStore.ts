import { create } from 'zustand'
import type { LineItem } from '@/types/parts'

interface LineItemsState {
  items: LineItem[]
  addPart: (part: { part_number: string; description: string; unit_price: number; image_url: string | null }) => void
  addCustom: () => void
  updateItem: (id: string, patch: Partial<Pick<LineItem, 'description' | 'unit_price' | 'quantity'>>) => void
  removeItem: (id: string) => void
  init: (items: LineItem[]) => void
  reset: () => void
}

export const useLineItemsStore = create<LineItemsState>((set, get) => ({
  items: [],

  addPart: (part) => {
    const existing = get().items.find((i) => i.part_number === part.part_number)
    if (existing) {
      set((state) => ({
        items: state.items.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i)),
      }))
      return
    }
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      part_number: part.part_number,
      description: part.description,
      unit_price: part.unit_price,
      quantity: 1,
      image_url: part.image_url,
    }
    set((state) => ({ items: [...state.items, newItem] }))
  },

  addCustom: () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      part_number: null,
      description: '',
      unit_price: 0,
      quantity: 1,
      image_url: null,
    }
    set((state) => ({ items: [...state.items, newItem] }))
  },

  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),

  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  init: (items) => set({ items }),
  reset: () => set({ items: [] }),
}))

export function lineItemsTotal(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
}
