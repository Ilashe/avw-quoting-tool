'use client'

import { TAB_LABELS, TAB_ORDER, useConfiguratorStore } from '@/store/configuratorStore'

export default function TabNav() {
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const setActiveTab = useConfiguratorStore((s) => s.setActiveTab)

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-6">
      {TAB_ORDER.map((tab) => {
        const isActive = tab === activeTab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        )
      })}
    </nav>
  )
}
