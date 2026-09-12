/**
 * General tab fields, per "AVW Quoting Tool Logic 6.23.2026.docx" (2026-06-24).
 * Not catalog-driven: these are fixed quote-header attributes, not priced equipment, so
 * they live in code rather than the equipment_items/categories tables (consistent with
 * categories.tab only covering 'equipment' | 'backroom' | 'vacuum' | 'pos' | 'controller').
 */

export type GeneralFieldWidget = 'text' | 'radio' | 'select' | 'address_autocomplete'

export interface GeneralFieldOption {
  value: string
  label: string
}

export interface GeneralFieldDef {
  key: string
  label: string
  widget: GeneralFieldWidget
  options?: GeneralFieldOption[]
  required?: boolean
}

export const generalFields: GeneralFieldDef[] = [
  { key: 'customer', label: 'Customer', widget: 'text', required: true },
  { key: 'ship_to_address', label: 'Ship to Address', widget: 'address_autocomplete', required: false },
  {
    key: 'equipment_drive_type',
    label: 'Equipment Drive Type',
    widget: 'radio',
    required: true,
    options: [
      { value: 'electric_motors', label: 'Electric Motors' },
      { value: 'hydraulic_drive', label: 'Hydraulic Drive' },
    ],
  },
]
