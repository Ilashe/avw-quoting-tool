import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">

      {/* ── Left: Brand panel ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 lg:flex lg:w-[420px] xl:w-[480px]">

        {/* Background decoration */}
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full border border-white/5" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[20rem] rounded-full border border-white/5" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-[22rem] rounded-full border border-white/5" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-black/30 to-transparent" />

        {/* Top: Logo + wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/avw-logo.png"
            alt="AVW Equipment Co."
            width={40}
            height={40}
            priority
            className="drop-shadow-lg"
          />
          <div>
            <p className="font-display text-lg uppercase tracking-[0.15em] text-white">AVW</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Equipment Co.</p>
          </div>
        </div>

        {/* Middle: Main copy */}
        <div className="relative z-10">
          <h1 className="font-display text-5xl uppercase leading-tight tracking-wide text-white xl:text-6xl">
            Configure.<br />Price.<br />Quote.
          </h1>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">
            The professional quoting platform built for car wash equipment dealers. Build accurate quotes in minutes, not hours.
          </p>
        </div>

        {/* Bottom: Feature bullets */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: '⚡', label: 'Auto-save as you configure' },
            { icon: '📋', label: 'Full equipment catalog built in' },
            { icon: '✓',  label: 'One-click quote completion' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white">
                {icon}
              </span>
              <span className="text-sm text-white/60">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">

          {/* Mobile-only logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Image src="/avw-logo.png" alt="AVW Equipment Co." width={56} height={56} priority />
            <p className="mt-3 font-display text-2xl uppercase tracking-wide text-ink">
              AVW Quoting Tool
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-display text-3xl uppercase tracking-wide text-ink">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} AVW Equipment Co. Inc. All rights reserved.
          </p>
        </div>
      </div>

    </main>
  )
}
