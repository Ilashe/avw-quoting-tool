'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function SectionAccordion({
  title,
  defaultOpen = true,
  allFilled = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  allFilled?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const mountedRef = useRef(false)

  useEffect(() => {
    // Skip the initial mount — only fire when allFilled transitions false → true
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (allFilled) {
      const timer = setTimeout(() => setOpen(false), 700)
      return () => clearTimeout(timer)
    }
  }, [allFilled])

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-display text-sm uppercase tracking-wide text-ink">{title}</span>
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}
