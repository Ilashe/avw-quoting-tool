'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { useSelectionsStore, type SelectionValue } from '@/store/selectionsStore'
import { saveQuote, createNewQuote } from '@/lib/actions/quotes'
import TopBar from './TopBar'
import TabNav from './TabNav'
import SummaryPanel from './SummaryPanel'
import FooterNav from './FooterNav'
import GeneralTab from './tabs/GeneralTab'
import EquipmentTab from './tabs/EquipmentTab'
import BackroomTab from './tabs/BackroomTab'
import VacuumTab from './tabs/VacuumTab'
import FixturesSignsTab from './tabs/FixturesSignsTab'
import MiscTunnelEquipmentTab from './tabs/MiscTunnelEquipmentTab'
import PosTab from './tabs/PosTab'
import ControllerTab from './tabs/ControllerTab'
import ItemsTab from './tabs/ItemsTab'

const TAB_COMPONENTS = {
  general: GeneralTab,
  equipment: EquipmentTab,
  backroom: BackroomTab,
  vacuum: VacuumTab,
  fixtures_signs: FixturesSignsTab,
  misc_tunnel_equipment: MiscTunnelEquipmentTab,
  pos: PosTab,
  controller: ControllerTab,
  items: ItemsTab,
}

export default function ConfiguratorShell({
  quoteId,
  initialSelections,
}: {
  quoteId: string
  initialSelections: Record<string, SelectionValue>
}) {
  const router = useRouter()
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const resetConfigurator = useConfiguratorStore((s) => s.reset)
  const values = useSelectionsStore((s) => s.values)
  const initSelections = useSelectionsStore((s) => s.init)
  const resetSelections = useSelectionsStore((s) => s.reset)
  const ActiveTabContent = TAB_COMPONENTS[activeTab]

  const [saving, setSaving] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Always holds the latest values without making them a useEffect dependency
  const latestValuesRef = useRef(values)
  latestValuesRef.current = values
  // Skip auto-save that fires immediately after store hydration
  const skipNextSave = useRef(true)
  // Set true when handleNewQuote has already flushed; prevents unmount cleanup from
  // overwriting the saved quote with {} after resetSelections() is processed by React.
  const explicitlySaved = useRef(false)

  // Hydrate the store from DB data whenever quoteId changes (including initial mount).
  // key={quoteId} on this component in the page ensures a full remount on quote switch,
  // but the effect also handles in-component navigation.
  useEffect(() => {
    skipNextSave.current = true
    explicitlySaved.current = false
    resetConfigurator()
    initSelections(initialSelections)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId])

  // Auto-save: debounced 2 s after any selection change; skips the hydration flush above.
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    setSaving(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      await saveQuote(quoteId, latestValuesRef.current)
      setSaving(false)
    }, 2000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  // Flush any pending save on unmount (e.g. clicking "← Quotes" mid-edit).
  // Skip if handleNewQuote already flushed explicitly — by then resetSelections() may
  // have run and latestValuesRef.current could be {} which would wipe the saved data.
  useEffect(() => {
    return () => {
      if (explicitlySaved.current) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveQuote(quoteId, latestValuesRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId])

  const handleNewQuote = useCallback(async () => {
    // Mark as explicitly saved so the unmount cleanup doesn't overwrite with stale {} state.
    explicitlySaved.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await saveQuote(quoteId, latestValuesRef.current)
    resetSelections()
    resetConfigurator()
    const newId = await createNewQuote()
    router.push(`/quotes/${newId}`)
  }, [quoteId, resetSelections, resetConfigurator, router])

  return (
    <div className="flex flex-col">
      <TopBar saving={saving} onNewQuote={handleNewQuote} />
      <TabNav />
      <div className="flex">
        <div className="flex-1 p-6">
          <ActiveTabContent />
        </div>
        <SummaryPanel />
      </div>
      <FooterNav />
    </div>
  )
}
