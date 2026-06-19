'use client'

import { useConfiguratorStore } from '@/store/configuratorStore'
import TopBar from './TopBar'
import TabNav from './TabNav'
import SummaryPanel from './SummaryPanel'
import FooterNav from './FooterNav'
import GeneralTab from './tabs/GeneralTab'
import EquipmentTab from './tabs/EquipmentTab'
import BackroomTab from './tabs/BackroomTab'
import VacuumTab from './tabs/VacuumTab'
import PosTab from './tabs/PosTab'
import ControllerTab from './tabs/ControllerTab'
import ItemsTab from './tabs/ItemsTab'

const TAB_COMPONENTS = {
  general: GeneralTab,
  equipment: EquipmentTab,
  backroom: BackroomTab,
  vacuum: VacuumTab,
  pos: PosTab,
  controller: ControllerTab,
  items: ItemsTab,
}

export default function ConfiguratorShell({
  quoteNumber,
  revisionLabel,
}: {
  quoteNumber: string
  revisionLabel: string
}) {
  const activeTab = useConfiguratorStore((s) => s.activeTab)
  const ActiveTabContent = TAB_COMPONENTS[activeTab]

  return (
    <div className="flex h-full flex-col">
      <TopBar quoteNumber={quoteNumber} revisionLabel={revisionLabel} />
      <TabNav />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <ActiveTabContent />
        </div>
        <SummaryPanel />
      </div>
      <FooterNav />
    </div>
  )
}
