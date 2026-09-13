'use client'

export interface SelectOption {
  value: string
  label: string
}

export default function SelectField({
  label,
  options,
  value,
  onChange,
  required,
  placeholder = 'Select…',
  warningLabel,
}: {
  label: string
  options: SelectOption[]
  value: string | null
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  warningLabel?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
        {warningLabel && <span className="ml-2 text-xs font-semibold text-red-600">{warningLabel}</span>}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
