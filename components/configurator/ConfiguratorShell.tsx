'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getTabOrder,
  useConfiguratorStore,
  PURCHASING_VACUUM_FIELD,
} from '@/store/configuratorStore'
import { useSelectionsStore, type SelectionValue } from '@/store/selectionsStore'
import { useLineItemsStore } from '@/store/lineItemsStore'
import { saveQuote, createNewQuote, finishQuote, revertToDraft } from '@/lib/actions/quotes'
import { useClearHiddenFields } from '@/lib/rules/useClearHiddenFields'
import { useApplyForcedValues } from '@/lib/rules/useApplyForcedValues'
import { useQuoteDocument } from '@/lib/quote/useQuoteDocument'
import { generateQuotePdf } from '@/lib/pdf/quotePdf'
import {
  VACUUM_CONFIG_FIELD,
  VACUUM_QUOTE_ITEMS_FIELD,
  VACUUM_STATS_FIELD,
} from '@/lib/vacuum/vacuumQuote'
import type { LineItem } from '@/types/parts'
import TopBar from './TopBar'
import TabNav from './TabNav'
import SummaryPanel from './SummaryPanel'
import FooterNav from './FooterNav'
import GeneralTab from './tabs/GeneralTab'
import EquipmentTab from './tabs/EquipmentTab'
import LayoutTab from './tabs/LayoutTab'
import BackroomTab from './tabs/BackroomTab'
import VacuumTab from './tabs/VacuumTab'
import FixturesSignsTab from './tabs/FixturesSignsTab'
import MiscTunnelEquipmentTab from './tabs/MiscTunnelEquipmentTab'
import PosTab from './tabs/PosTab'
import ControllerTab from './tabs/ControllerTab'
import ItemsTab from './tabs/ItemsTab'
import CommentTab from './tabs/CommentTab'
import ReviewTab from './tabs/ReviewTab'

export default function ConfiguratorShell({
  quoteId,
  quoteNumber,
  initialSelections,
  initialLineItems,
  initialStatus,
}: {
  quoteId: string
  quoteNumber: string
  initialSelections: Record<string, SelectionValue>
  initialLineItems: LineItem[]
  initialStatus: string
}) {
  const router = useRouter()
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const setActiveTab = useConfiguratorStore((s) => s.setActiveTab)
  const goNext = useConfiguratorStore((s) => s.goNext)
  const resetConfigurator = useConfiguratorStore((s) => s.reset)
  const values = useSelectionsStore((s) => s.values)
  const setField = useSelectionsStore((s) => s.setField)
  const initSelections = useSelectionsStore((s) => s.init)
  const resetSelections = useSelectionsStore((s) => s.reset)
  const lineItems = useLineItemsStore((s) => s.items)
  const initLineItems = useLineItemsStore((s) => s.init)
  const resetLineItems = useLineItemsStore((s) => s.reset)
  useClearHiddenFields()
  useApplyForcedValues()

  const purchasingVacuum = values[PURCHASING_VACUUM_FIELD]
  const tabOrder = useMemo(() => getTabOrder(values), [purchasingVacuum]) // eslint-disable-line react-hooks/exhaustive-deps

  const quoteDocument = useQuoteDocument()

  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(initialStatus)
  const [generating, setGenerating] = useState(false)
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
  // Set true when handleNewQuote/handleGenerate has already flushed; prevents unmount
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

  // Answering "Purchasing Vacuum: No" takes the Vacuum tab out of the flow, so anything it
  // generated has to come off the quote too — otherwise a vacuum system the customer isn't
  // buying would keep adding to the total with no tab left to remove it from.
  useEffect(() => {
    if (purchasingVacuum === 'yes') return
    if (values[VACUUM_QUOTE_ITEMS_FIELD] != null) setField(VACUUM_QUOTE_ITEMS_FIELD, null)
    if (values[VACUUM_STATS_FIELD] != null) setField(VACUUM_STATS_FIELD, null)
    if (values[VACUUM_CONFIG_FIELD] != null) setField(VACUUM_CONFIG_FIELD, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasingVacuum, values])

  // Never leave the user stranded on a tab that just left the flow.
  useEffect(() => {
    if (!tabOrder.includes(activeTab)) setActiveTab(tabOrder[0])
  }, [tabOrder, activeTab, setActiveTab])

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

  // Review's forward button: produce the PDF on AVW's quote form, then save + mark complete.
  // The quote deliberately stays open afterwards so the user can tweak and re-generate.
  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      await generateQuotePdf(quoteDocument, { quoteNumber })
      explicitlySaved.current = true
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      await finishQuote(quoteId, latestValuesRef.current, latestLineItemsRef.current)
      explicitlySaved.current = false
      setStatus('complete')
      setSaving(false)
    } finally {
      setGenerating(false)
    }
  }, [quoteDocument, quoteId, quoteNumber])

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

  const advance = useCallback(() => goNext(tabOrder), [goNext, tabOrder])

  function renderTab() {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />
      case 'equipment':
        return <EquipmentTab />
      case 'layout':
        return <LayoutTab />
      case 'backroom':
        return <BackroomTab />
      case 'vacuum':
        return <VacuumTab onNext={advance} />
      case 'fixtures_signs':
        return <FixturesSignsTab />
      case 'misc_tunnel_equipment':
        return <MiscTunnelEquipmentTab />
      case 'pos':
        return <PosTab />
      case 'controller':
        return <ControllerTab />
      case 'comment':
        return <CommentTab onNext={advance} />
      case 'review':
        return <ReviewTab />
      case 'items':
        return <ItemsTab />
    }
  }

  return (
    <div className="flex flex-col">
      <TopBar saving={saving} onNewQuote={handleNewQuote} />
      <TabNav order={tabOrder} />
      <div className="flex">
        <div className="flex-1 p-6">{renderTab()}</div>
        <SummaryPanel />
      </div>
      <FooterNav
        order={tabOrder}
        onGenerate={handleGenerate}
        isComplete={status === 'complete'}
        generating={generating}
      />
    </div>
  )
}
