export const CATALOG_ITEM_TYPES = ["product", "service"] as const

export type CatalogItemType = (typeof CATALOG_ITEM_TYPES)[number]

export const ITEM_STATUSES = ["draft", "active", "archived"] as const

export type ItemStatus = (typeof ITEM_STATUSES)[number]

export const ITEM_ATTRIBUTE_VALUE_TYPES = [
  "text",
  "number",
  "boolean",
  "date",
] as const

export type ItemAttributeValueType =
  (typeof ITEM_ATTRIBUTE_VALUE_TYPES)[number]

export type Category = {
  id: number
  parent_id: number | null
  name: string
  slug: string
}

export type ItemAttribute = {
  id: number
  item_id: number
  name: string
  value: string
  value_type: ItemAttributeValueType
  sort_order: number
}

export type Item = {
  id: number
  actor_id: number
  type: CatalogItemType
  category_id: number
  title: string
  description: string | null
  status: ItemStatus
  created_at: string
}

export type ItemWithRelations = Item & {
  category?: Category
  attributes: ItemAttribute[]
}

export type ItemCreate = Omit<Item, "id" | "created_at"> & {
  status?: ItemStatus
}

export type ItemUpdate = Partial<Omit<Item, "id" | "created_at">>

export type CategoryCreate = Omit<Category, "id">

export type CategoryUpdate = Partial<CategoryCreate>

export type ItemAttributeCreate = Omit<ItemAttribute, "id">

export type ItemAttributeUpdate = Partial<
  Omit<ItemAttributeCreate, "item_id">
>
