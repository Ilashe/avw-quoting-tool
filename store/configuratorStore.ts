import { create } from 'zustand'

export const TAB_ORDER = [
  'general',
  'equipment',
  'backroom',
  'vacuum',
  'pos',
  'controller',
  'items',
] as const

export type TabKey = (typeof TAB_ORDER)[number]

export const TAB_LABELS: Record<TabKey, string> = {
  general: 'General',
  equipment: 'Equipment',
  backroom: 'Backroom',
  vacuum: 'Vacuum',
  pos: 'POS',
  controller: 'Controller',
  items: 'Items',
}

interface ConfiguratorState {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  goNext: () => void
  goBack: () => void
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  activeTab: 'general',
  setActiveTab: (tab) => set({ activeTab: tab }),
  goNext: () => {
    const index = TAB_ORDER.indexOf(get().activeTab)
    const next = TAB_ORDER[index + 1]
    if (next) set({ activeTab: next })
  },
  goBack: () => {
    const index = TAB_ORDER.indexOf(get().activeTab)
    const prev = TAB_ORDER[index - 1]
    if (prev) set({ activeTab: prev })
  },
}))
