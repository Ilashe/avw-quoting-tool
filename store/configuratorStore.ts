import { create } from 'zustand'
import type { SelectionValue } from './selectionsStore'

/**
 * Every tab the configurator knows how to render, in order.
 *
 * 'items' is deliberately absent — the client asked (2026-09-18) for the Items tab to come out
 * of the flow while keeping it available in case it's wanted back. Its component
 * (tabs/ItemsTab.tsx) and every field it wrote (items_discount_percent, items_notes, the
 * line_items array) are untouched: existing quotes keep their line items, the discount still
 * applies to the total, and re-listing 'items' here between 'controller' and 'comment' is the
 * only change needed to bring the tab back.
 */
export const ALL_TABS = [
  'general',
  'equipment',
  'backroom',
  'vacuum',
  'fixtures_signs',
  'misc_tunnel_equipment',
  'pos',
  'controller',
  'comment',
] as const

export type TabKey = (typeof ALL_TABS)[number] | 'items'

/** Tabs built but currently out of the flow — see the note on ALL_TABS. */
export const HIDDEN_TABS: readonly TabKey[] = ['items']

export const TAB_LABELS: Record<TabKey, string> = {
  general: 'General',
  equipment: 'Equipment',
  backroom: 'Backroom',
  vacuum: 'Vacuum',
  fixtures_signs: 'Fixtures & Signs',
  misc_tunnel_equipment: 'Misc Tunnel Equip.',
  pos: 'POS',
  controller: 'MCC-Controller',
  comment: 'Comment',
  items: 'Items',
}

/** Label of the page the last tab leads to. Review is a route (/quotes/[id]/review), not a tab. */
export const REVIEW_LABEL = 'Review'

/** General-tab field gating the Vacuum tab. */
export const PURCHASING_VACUUM_FIELD = 'purchasing_vacuum'

/**
 * The tabs actually shown for a given set of selections. Vacuum only exists once "Purchasing
 * Vacuum" is answered Yes on the General tab — answering No (or leaving it blank) drops it from
 * the nav, the Next/Back sequence and the Review page alike.
 */
export function getTabOrder(values: Record<string, SelectionValue>): TabKey[] {
  const buyingVacuum = values[PURCHASING_VACUUM_FIELD] === 'yes'
  return ALL_TABS.filter((tab) => tab !== 'vacuum' || buyingVacuum)
}

interface ConfiguratorState {
  activeTab: TabKey
  /**
   * Set when the user leaves for the Review page; the configurator, on remounting for that same
   * quote, resumes on the tab they left (instead of resetting to General) and reuses the
   * in-memory selections. This is what makes both Review's Back button and the browser's own
   * Back button land on the Comment tab.
   */
  resumeQuoteId: string | null
  setResumeQuoteId: (quoteId: string | null) => void
  setActiveTab: (tab: TabKey) => void
  goNext: (order: TabKey[]) => void
  goBack: (order: TabKey[]) => void
  reset: () => void
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  activeTab: 'general',
  resumeQuoteId: null,
  setResumeQuoteId: (quoteId) => set({ resumeQuoteId: quoteId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  goNext: (order) => {
    const index = order.indexOf(get().activeTab)
    const next = order[index + 1]
    if (next) set({ activeTab: next })
  },
  goBack: (order) => {
    const index = order.indexOf(get().activeTab)
    const prev = order[index - 1]
    if (prev) set({ activeTab: prev })
  },
  reset: () => set({ activeTab: 'general' }),
}))
