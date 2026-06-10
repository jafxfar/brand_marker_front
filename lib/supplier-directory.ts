import type { CatalogItemWithRelations, Category, CompanyWithRelations } from "@/types"
import { DEMO_BUYER_ACTOR_IDS } from "@/lib/mock/companies"

export const isSupplierCompany = (company: CompanyWithRelations): boolean => {
  if (company.actor_type) return company.actor_type === "supplier"
  return !DEMO_BUYER_ACTOR_IDS.includes(
    company.id as (typeof DEMO_BUYER_ACTOR_IDS)[number],
  )
}

export const isBuyerCompany = (company: CompanyWithRelations): boolean =>
  !isSupplierCompany(company)

export const getSupplierCategories = (
  items: CatalogItemWithRelations[],
): Category[] => {
  const seen = new Map<number, Category>()
  for (const item of items) {
    if (item.status !== "active" || !item.category) continue
    seen.set(item.category.id, item.category)
  }
  return [...seen.values()]
}

export const getActiveCatalogItemsCount = (
  items: CatalogItemWithRelations[],
): number => items.filter((i) => i.status === "active").length

export const formatSupplierCatalogSummary = (
  company: CompanyWithRelations,
  activeItemsCount: number,
  categories: Category[],
): string => {
  const parts: string[] = []
  if (activeItemsCount > 0) {
    parts.push(`${activeItemsCount} поз. в каталоге`)
  }
  if (categories.length > 0) {
    parts.push(categories.slice(0, 2).map((c) => c.name).join(", "))
  }
  if (parts.length === 0 && company.description) {
    return company.description.slice(0, 80)
  }
  return parts.join(" · ") || "Поставщик на платформе"
}

export const matchesSupplierSearch = (
  company: CompanyWithRelations,
  query: string,
): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    company.title,
    company.legal_name,
    company.description,
    company.city,
    company.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

export const companyMatchesCategorySlug = (
  categories: Category[],
  slug: string,
): boolean => {
  if (!slug) return true
  return categories.some((c) => c.slug === slug)
}
