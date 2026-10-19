import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type {
  CatalogItemWithRelations,
  CompanyWithRelations,
  PublicSupplier,
  Review,
  RfqWithRelations,
} from "@/types"
import { apiFetch } from "./client"

export type CategoryTree = {
  id: number
  name: string
  slug: string
  children?: CategoryTree[]
}

export type PlatformSettingsInput = {
  commission_percent: number
  commission_min: number
  max_contract_amount: number | null
}

export type PlatformSettings = PlatformSettingsInput & {
  currency: string
}

export const publicApi = {
  categories: () => apiFetch<CategoryTree[]>("/public/categories"),

  platformSettings: () => apiFetch<PlatformSettings>("/public/platform-settings"),

  suppliers: (q?: string, category?: string, params: PageParams = {}) =>
    apiFetch<Page<PublicSupplier>>(
      `/public/suppliers${buildPageQuery({ ...params, q, category })}`,
    ),

  supplier: (actorId: number) =>
    apiFetch<PublicSupplier>(`/public/suppliers/${actorId}`),

  supplierCatalog: (actorId: number, params: PageParams = {}) =>
    apiFetch<Page<CatalogItemWithRelations>>(
      `/public/suppliers/${actorId}/catalog${buildPageQuery(params)}`,
    ),

  supplierReviews: (actorId: number, params: PageParams = {}) =>
    apiFetch<Page<Review>>(
      `/public/suppliers/${actorId}/reviews${buildPageQuery(params)}`,
    ),

  company: (id: number) => apiFetch<CompanyWithRelations>(`/public/companies/${id}`),

  companyReviews: (id: number, params: PageParams = {}) =>
    apiFetch<Page<Review>>(
      `/public/companies/${id}/reviews${buildPageQuery(params)}`,
    ),

  companyCatalog: (id: number, params: PageParams = {}) =>
    apiFetch<Page<CatalogItemWithRelations>>(
      `/public/companies/${id}/catalog${buildPageQuery(params)}`,
    ),

  catalog: (q?: string, category?: string, params: PageParams = {}) =>
    apiFetch<Page<CatalogItemWithRelations>>(
      `/public/catalog${buildPageQuery({ ...params, q, category })}`,
    ),

  catalogItem: (id: number) =>
    apiFetch<CatalogItemWithRelations>(`/public/catalog/items/${id}`),

  rfqs: (params: PageParams = {}) =>
    apiFetch<Page<RfqWithRelations>>(`/public/rfqs${buildPageQuery(params)}`),
}
