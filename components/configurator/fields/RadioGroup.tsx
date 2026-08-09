'use client'

export interface RadioOption {
  value: string
  label: string
}

export default function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  required,
}: {
  label: string
  name: string
  options: RadioOption[]
  value: string | null
  onChange: (value: string | null) => void
  required?: boolean
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              className={`relative cursor-pointer rounded-full border px-2.5 py-1 text-xs transition ${
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
              {option.label}
            </label>
          )
        })}
      </div>
    </div>
  )
}
