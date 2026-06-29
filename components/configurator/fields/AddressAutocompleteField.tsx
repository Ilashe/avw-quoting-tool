'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

// setOptions must be called exactly once per page load across all component instances.
let mapsConfigured = false

export default function AddressAutocompleteField({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // All Google Maps init is inside useEffect — never touches window during SSR
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return
    if (!mapsConfigured) {
      setOptions({ key: apiKey })
      mapsConfigured = true
    }
    importLibrary('places').then(() => setReady(true)).catch(() => {})
  }, [])

  // Keep local input in sync if parent resets the value
  useEffect(() => { setInputValue(value) }, [value])

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!ready || query.length < 3) { setSuggestions([]); return }
    try {
      const { suggestions: results } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: query })
      setSuggestions(results)
      setOpen(results.length > 0)
    } catch {
      setSuggestions([])
    }
  }, [ready])

  const handleChange = (v: string) => {
    setInputValue(v)
    onChangeRef.current(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300)
  }

  const handleSelect = async (s: google.maps.places.AutocompleteSuggestion) => {
    setOpen(false)
    setSuggestions([])
    const place = s.placePrediction?.toPlace()
    if (!place) return
    await place.fetchFields({ fields: ['formattedAddress'] })
    const addr = place.formattedAddress ?? ''
    setInputValue(addr)
    onChangeRef.current(addr)
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Start typing an address…"
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="cursor-pointer px-3 py-2 text-sm text-ink hover:bg-mist"
            >
              {s.placePrediction?.text.text}
            </li>
          ))}
        </ul>
      )}
      {!apiKey && (
        <p className="mt-1 text-xs text-amber-600">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to enable address suggestions.
        </p>
      )}
    </div>
  )
}
