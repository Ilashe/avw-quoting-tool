'use client'

import { useActionState, useState } from 'react'
import { login } from '@/lib/auth/actions'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="space-y-5">

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
        />
        {state?.fieldErrors?.email && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <span>⚠</span> {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <span>⚠</span> {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Global error */}
      {state?.error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-ink disabled:opacity-60"
      >
        {pending && (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
        )}
        {pending ? 'Signing in…' : 'Sign In'}
      </button>

    </form>
  )
}
