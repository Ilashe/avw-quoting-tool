'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { useSelectionsStore, type SelectionValue } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { saveQuote, createNewQuote, finishQuote, revertToDraft } from '@/lib/actions/quotes'
import type { LineItem } from '@/types/parts'
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
  initialLineItems,
  initialStatus,
}: {
  quoteId: string
  initialSelections: Record<string, SelectionValue>
  initialLineItems: LineItem[]
  initialStatus: string
}) {
  const router = useRouter()
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const resetConfigurator = useConfiguratorStore((s) => s.reset)
  const values = useSelectionsStore((s) => s.values)
  const initSelections = useSelectionsStore((s) => s.init)
  const resetSelections = useSelectionsStore((s) => s.reset)
  const lineItems = useLineItemsStore((s) => s.items)
  const initLineItems = useLineItemsStore((s) => s.init)
  const resetLineItems = useLineItemsStore((s) => s.reset)
  const ActiveTabContent = TAB_COMPONENTS[activeTab]

  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(initialStatus)
  const [finishing, setFinishing] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Always holds the latest values without making them a useEffect dependency
  const latestValuesRef = useRef(values)
  latestValuesRef.current = values
  const latestLineItemsRef = useRef(lineItems)
  latestLineItemsRef.current = lineItems
  // Latest status without making it an effect dependency
  const statusRef = useRef(initialStatus)
  statusRef.current = status
  // Skip auto-save that fires immediately after store hydration
  const skipNextSave = useRef(true)
  // Set true when handleNewQuote/handleFinish has already flushed; prevents unmount
  // cleanup from overwriting the saved quote with {} after resetSelections() runs.
  const explicitlySaved = useRef(false)

  // Hydrate the store from DB data whenever quoteId changes.
  useEffect(() => {
    skipNextSave.current = true
    explicitlySaved.current = false
    setStatus(initialStatus)
    resetConfigurator()
    initSelections(initialSelections)
    initLineItems(initialLineItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId])

  // Auto-save: debounced 2 s after any selection or line item change.
  // Also auto-reverts status to draft when the user edits a completed quote.
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    // Revert to draft the moment the user makes any edit on a completed quote
    if (statusRef.current === 'complete') {
      setStatus('draft')
      revertToDraft(quoteId) // fire-and-forget, non-blocking
    }

    setSaving(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      await saveQuote(quoteId, latestValuesRef.current, latestLineItemsRef.current)
      setSaving(false)
    }, 2000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, lineItems])

  // Flush any pending save on unmount (e.g. clicking "← Quotes" mid-edit).
  useEffect(() => {
    return () => {
      if (explicitlySaved.current) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveQuote(quoteId, latestValuesRef.current, latestLineItemsRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId])

  // Finish: save + mark complete + navigate to dashboard
  const handleFinish = useCallback(async () => {
    setFinishing(true)
    explicitlySaved.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await finishQuote(quoteId, latestValuesRef.current, latestLineItemsRef.current)
    setStatus('complete')
    setFinishing(false)
    router.push('/quotes')
  }, [quoteId, router])

  const handleNewQuote = useCallback(async () => {
    explicitlySaved.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await saveQuote(quoteId, latestValuesRef.current, latestLineItemsRef.current)
    resetSelections()
    resetLineItems()
    resetConfigurator()
    const newId = await createNewQuote()
    router.push(`/quotes/${newId}`)
  }, [quoteId, resetSelections, resetLineItems, resetConfigurator, router])

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
      <FooterNav
        onFinish={handleFinish}
        isComplete={status === 'complete'}
        finishing={finishing}
      />
    </div>
  )
}
