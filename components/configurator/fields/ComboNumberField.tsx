'use client'

import { useId } from 'react'

export default function ComboNumberField({
  label,
  value,
  onChange,
  min = 40,
  max = 165,
  unit,
  allowNone,
  helperText,
  helperLinkText,
  helperLinkHref,
}: {
  label: string
  value: string | number | null
  onChange: (value: string | number | null) => void
  min?: number
  max?: number
  unit?: string
  allowNone?: boolean
  helperText?: string
  helperLinkText?: string
  helperLinkHref?: string
}) {
  const listId = useId()
  const isNone = value === 'none'
  const strVal = isNone || value === null || value === undefined ? '' : String(value)
  const num = strVal === '' ? null : Number(strVal)
  const outOfRange = !isNone && num !== null && !isNaN(num) && (num < min || num > max)

  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        <input
          type="text"
          inputMode="numeric"
          list={listId}
          value={strVal}
          disabled={isNone}
          onChange={(e) => {
            const v = e.target.value
            if (v === '') { onChange(null); return }
            const n = Number(v)
            onChange(isNaN(n) ? v : n)
          }}
          className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50 disabled:text-slate-400"
          placeholder={`${min}–${max}`}
        />
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
        {allowNone && (
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={isNone}
              onChange={(e) => onChange(e.target.checked ? 'none' : null)}
            />
            None
          </label>
        )}
      </div>
      <datalist id={listId}>
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
          <option key={n} value={String(n)} />
        ))}
      </datalist>
      <p className="mt-1 text-xs text-slate-400">
        Valid range: {min}–{max} {unit}.{' '}
        {helperText && <>{helperText} </>}
        {helperLinkHref && helperLinkText && (
          <a
            href={helperLinkHref}
            onClick={(e) => { e.preventDefault(); window.location.href = helperLinkHref }}
            className="cursor-pointer text-brand underline hover:opacity-80"
          >
            {helperLinkText}
          </a>
        )}
      </p>
      {outOfRange && (
        <p className="mt-1 text-xs text-red-500">
          Outside valid range ({min}–{max} {unit}).{' '}
          {helperLinkHref && (
            <a
              href={helperLinkHref}
              onClick={(e) => { e.preventDefault(); window.location.href = helperLinkHref }}
              className="cursor-pointer underline"
            >
              Contact tech support
            </a>
          )}{' '}
          if you need a custom length.
        </p>
      )}
    </div>
  )
}
