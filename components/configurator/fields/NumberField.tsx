'use client'

export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  allowNone,
  helperText,
}: {
  label: string
  value: string | number | null
  onChange: (value: string | number | null) => void
  min?: number
  max?: number
  unit?: string
  allowNone?: boolean
  helperText?: string
}) {
  const isNone = value === 'none'
  const outOfRange =
    !isNone &&
    value !== null &&
    value !== '' &&
    ((min !== undefined && Number(value) < min) || (max !== undefined && Number(value) > max))

  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="mt-1 flex items-center gap-3">
        <input
          type="number"
          min={min}
          max={max}
          disabled={isNone}
          value={isNone ? '' : value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50 disabled:text-slate-400"
        />
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
        {allowNone && (
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isNone}
              onChange={(e) => onChange(e.target.checked ? 'none' : null)}
            />
            None
          </label>
        )}
      </div>
      {min !== undefined && max !== undefined && (
        <p className="mt-1 text-xs text-slate-400">
          Valid range: {min}–{max}
          {unit}. {helperText}
        </p>
      )}
      {outOfRange && <p className="mt-1 text-xs text-red-600">Out of range ({min}–{max}{unit}).</p>}
    </div>
  )
}
