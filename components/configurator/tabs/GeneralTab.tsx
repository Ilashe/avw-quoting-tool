'use client'

import { generalFields } from '@/lib/configurator/generalFields'
import { useSelectionsStore } from '@/store/selectionsStore'
import TextField from '../fields/TextField'
import RadioGroup from '../fields/RadioGroup'
import SelectField from '../fields/SelectField'
import AddressAutocompleteField from '../fields/AddressAutocompleteField'

export default function GeneralTab() {
  const values = useSelectionsStore((s) => s.values)
  const setField = useSelectionsStore((s) => s.setField)

  return (
    <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
      {generalFields.map((field) => {
        const value = values[field.key] ?? null

        if (field.widget === 'address_autocomplete') {
          return (
            <AddressAutocompleteField
              key={field.key}
              label={field.label}
              required={field.required}
              value={typeof value === 'string' ? value : ''}
              onChange={(v) => setField(field.key, v)}
            />
          )
        }

        if (field.widget === 'text') {
          return (
            <TextField
              key={field.key}
              label={field.label}
              required={field.required}
              value={typeof value === 'string' ? value : ''}
              onChange={(v) => setField(field.key, v)}
            />
          )
        }

        if (field.widget === 'radio') {
          return (
            <RadioGroup
              key={field.key}
              name={field.key}
              label={field.label}
              required={field.required}
              options={field.options ?? []}
              value={typeof value === 'string' ? value : null}
              onChange={(v) => setField(field.key, v)}
            />
          )
        }

        return (
          <SelectField
            key={field.key}
            label={field.label}
            required={field.required}
            options={field.options ?? []}
            value={typeof value === 'string' ? value : null}
            onChange={(v) => setField(field.key, v)}
          />
        )
      })}
    </div>
  )
}
