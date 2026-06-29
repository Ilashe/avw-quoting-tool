'use client'

import { logout } from '@/lib/auth/actions'
import { useSelectionsStore } from '@/store/selectionsStore'
import { useConfiguratorStore } from '@/store/configuratorStore'

export default function LogoutButton() {
  const resetSelections = useSelectionsStore((s) => s.reset)
  const resetConfigurator = useConfiguratorStore((s) => s.reset)

  async function handleLogout() {
    resetSelections()
    resetConfigurator()
    await logout()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand hover:border-brand"
    >
      Sign Out
    </button>
  )
}
