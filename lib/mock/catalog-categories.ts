import type { Category } from "@/types"

export const catalogCategories: Category[] = [
  { id: 1, parent_id: null, name: "ИТ и оборудование", slug: "it-equipment" },
  { id: 2, parent_id: null, name: "Разработка ПО", slug: "software-dev" },
  { id: 3, parent_id: null, name: "Логистика", slug: "logistics" },
  { id: 4, parent_id: null, name: "Строительство", slug: "construction" },
  { id: 5, parent_id: null, name: "Маркетинг", slug: "marketing" },
  { id: 6, parent_id: null, name: "Консалтинг", slug: "consulting" },
]

export const getCatalogCategory = (id: number): Category | undefined =>
  catalogCategories.find((c) => c.id === id)
