import type { CatalogItemWithRelations, Currency } from "@/types"
import type { MarketplaceService } from "@/types/marketplace"
import { rfqCategories } from "@/lib/rfq-categories-list"

export type RfqFormPrefill = {
  type?: "product" | "service"
  title?: string
  category_id?: string
  description?: string
  budget_type?: "fixed" | "range" | "open"
  budget_from?: string
  budget_to?: string
  currency?: Currency
  visibility?: "public" | "invited_only"
  quantity?: string
  delivery_country?: string
  delivery_city?: string
  delivery_address?: string
  delivery_date?: string
  project_duration?: string
  start_date?: string
  team_size_required?: string
  experience_required?: string
  deadline?: string
}

const resolveCategoryId = (slugOrId: string | undefined): string => {
  if (!slugOrId) return ""
  if (rfqCategories.some((c) => c.id === slugOrId)) return slugOrId
  return ""
}

export const prefillFromCatalogItem = (
  item: CatalogItemWithRelations,
): RfqFormPrefill => {
  const pricing = item.pricing
  const price =
    pricing?.fixed_price
    ?? pricing?.hourly_rate
    ?? pricing?.monthly_rate
    ?? null

  return {
    type: item.type === "product" ? "product" : "service",
    title: item.title,
    description: item.description ?? "",
    category_id: resolveCategoryId(item.category?.slug),
    budget_type: price != null ? "fixed" : "open",
    budget_from: price != null ? String(price) : "",
    currency: (pricing?.currency as Currency | undefined) ?? "TJS",
    visibility: "invited_only",
  }
}

export const prefillFromMarketplaceService = (
  service: MarketplaceService,
): RfqFormPrefill => ({
  type: "service",
  title: service.title,
  description: service.description,
  category_id: resolveCategoryId(service.categoryId),
  budget_type: "open",
  visibility: "invited_only",
})
