export interface Part {
  part_number: string
  description: string | null
  unit_price: number | null
  is_active: boolean
}

export interface PartImage {
  part_number: string
  storage_path: string
  sort_order: number
}

export interface PartWithImage extends Part {
  image_url: string | null
}

export interface LineItem {
  id: string
  part_number: string | null // null for a manual/custom line
  description: string
  unit_price: number
  quantity: number
  image_url: string | null
}
