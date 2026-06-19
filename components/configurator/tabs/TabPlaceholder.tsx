export default function TabPlaceholder({ tabName, phase }: { tabName: string; phase: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center">
      <p className="font-display text-lg uppercase tracking-wide text-ink">{tabName}</p>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        This section&apos;s fields are built in Phase {phase}. The tab, navigation, and summary
        panel around it are already wired up.
      </p>
    </div>
  )
}
