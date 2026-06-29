'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashScreen() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Tiny delay so the browser paints once before the opacity transition fires
    const show = setTimeout(() => setVisible(true), 30)
    const go = setTimeout(() => router.replace('/quotes'), 500)
    return () => { clearTimeout(show); clearTimeout(go) }
  }, [router])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-ink">
      <div
        className={`flex flex-col items-center gap-8 transition-all duration-300 ease-out ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Logo */}
        <div className="relative h-96 w-96 drop-shadow-2xl">
          <Image
            src="/avw-logo.png"
            alt="AVW Equipment Co."
            fill
            sizes="384px"
            className="object-contain"
            priority
          />
        </div>

        {/* Wordmark */}
        <div className="text-center">
          <p className="font-display text-6xl uppercase tracking-[0.25em] text-white">AVW</p>
          <p className="mt-1 text-sm uppercase tracking-[0.5em] text-slate-400">Equipment Co.</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-slate-600">
            Quoting Tool
          </p>
        </div>
      </div>
    </div>
  )
}
