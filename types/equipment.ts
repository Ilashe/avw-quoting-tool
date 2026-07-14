export type FieldWidget =
  | 'text'
  | 'radio'
  | 'select'
  | 'number'
  | 'select_range'
  | 'combobox_range'
  | 'pending'
  | 'multi_part_picker'

export interface EquipmentItemMetadata {
  field_key: string
  widget: FieldWidget
  required?: boolean
  helper_text?: string
  helper_link_text?: string
  helper_link_href?: string
  // number / combobox_range widgets
  min?: number
  max?: number
  unit?: string
  allow_none?: boolean
}

export interface Category {
  id: string
  tab: string
  section: string
  display_name: string
  sort_order: number
}

export interface EquipmentItem {
  id: string
  sku: string
  name: string
  description: string | null
  category_id: string | null
  unit_price: number
  is_active: boolean
  metadata: EquipmentItemMetadata
}

export interface EquipmentOption {
  id: string
  item_id: string
  option_key: string
  option_label: string
  option_value: string
  price_modifier: number
  sort_order: number
}

export type RuleActionType = 'show' | 'hide' | 'require' | 'set_value' | 'exclude'

export interface DependencyRule {
  id: string
  rule_name: string
  trigger_field: string
  trigger_value: string
  action_type: RuleActionType
  target_field: string
  target_value: string | null
}
