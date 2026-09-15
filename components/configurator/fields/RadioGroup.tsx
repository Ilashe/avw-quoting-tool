'use client'

export interface RadioOption {
  value: string
  label: string
}

// Swatch colors for option values that are literal color names — every Color field in this
// catalog (Belt Color, Tire Pusher Color, Safety Stripe Color, Pit Grating Color, Housing Color)
// uses these exact lowercase value strings, so this is detected generically by value rather than
// needing a per-field flag (client instruction, 2026-09-15: every color option should carry its
// color on the button).
const COLOR_SWATCHES: Record<string, string> = {
  black: '#000000',
  blue: '#2563eb',
  red: '#dc2626',
  yellow: '#eab308',
  gray: '#9ca3af',
  orange: '#f97316',
  green: '#16a34a',
}

export default function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  required,
  warningLabel,
}: {
  label: string
  name: string
  options: RadioOption[]
  value: string | null
  onChange: (value: string | null) => void
  required?: boolean
  warningLabel?: string
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
        {warningLabel && <span className="ml-2 text-xs font-semibold text-red-600">{warningLabel}</span>}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value === option.value
          const swatch = COLOR_SWATCHES[option.value]
          return (
            <label
              key={option.value}
              className={`relative flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                checked
                  ? 'border-brand bg-brand text-white'
                  : 'border-slate-200 text-slate-600 hover:border-brand/50'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                // Native radios don't fire onChange when clicking an already-checked option
                // (no state change from the browser's point of view), so the actual
                // select/deselect logic lives in onClick instead — clicking the currently
                // selected option clears the field back to null rather than staying stuck on
                // it, same as any other option toggling it on.
                onChange={() => {}}
                onClick={() => onChange(checked ? null : option.value)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {swatch && (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />
              )}
              {option.label}
            </label>
          )
        })}
      </div>
    </div>
  )
}
