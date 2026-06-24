/**
 * General tab fields, per "AVW Quoting Tool Logic 6.23.2026.docx" (2026-06-24).
 * Not catalog-driven: these are fixed quote-header attributes, not priced equipment, so
 * they live in code rather than the equipment_items/categories tables (consistent with
 * categories.tab only covering 'equipment' | 'backroom' | 'vacuum' | 'pos' | 'controller').
 */

export type GeneralFieldWidget = 'text' | 'radio' | 'select'

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
  { key: 'ship_to_state', label: 'Ship to State', widget: 'text', required: true },
  { key: 'ship_to_country', label: 'Ship to Country', widget: 'text', required: true },
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
  {
    key: 'site_3_phase_voltage',
    label: 'Site 3-Phase Voltage',
    widget: 'select',
    required: true,
    options: [
      { value: '460_480v_60hz', label: '460/480 Volt 60 hz' },
      { value: '575v_60hz', label: '575 Volt 60 hz' },
      { value: '380_400v_50hz', label: '380/400 Volt 50 hz' },
      { value: '208_230v_60hz', label: '208/230 Volt 60 hz' },
    ],
  },
  {
    key: 'site_standard_voltage',
    label: 'Site Standard Voltage',
    widget: 'radio',
    required: true,
    options: [
      { value: '120v', label: '120V' },
      { value: '220v', label: '220V' },
    ],
  },
  {
    key: 'liftgate_required',
    label: 'Liftgate Required',
    widget: 'radio',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
]
