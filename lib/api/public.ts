import type {
  CatalogItemWithRelations,
  CompanyWithRelations,
  PublicSupplier,
  RfqWithRelations,
} from "@/types"
import { apiFetch } from "./client"

export type CategoryTree = {
  id: number
  name: string
  slug: string
  children?: CategoryTree[]
}

export const publicApi = {
  categories: () => apiFetch<CategoryTree[]>("/public/categories"),

  suppliers: (q?: string, category?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (category) params.set("category", category)
    const qs = params.toString()
    return apiFetch<PublicSupplier[]>(
      `/public/suppliers${qs ? `?${qs}` : ""}`,
    )
  },

  supplier: (actorId: number) =>
    apiFetch<PublicSupplier>(`/public/suppliers/${actorId}`),

  supplierCatalog: (actorId: number) =>
    apiFetch<CatalogItemWithRelations[]>(`/public/suppliers/${actorId}/catalog`),

  supplierReviews: (actorId: number) =>
    apiFetch<import("@/types").Review[]>(`/public/suppliers/${actorId}/reviews`),

  company: (id: number) => apiFetch<CompanyWithRelations>(`/public/companies/${id}`),

  companyReviews: (id: number) =>
    apiFetch<import("@/types").Review[]>(`/public/companies/${id}/reviews`),

  companyCatalog: (id: number) =>
    apiFetch<CatalogItemWithRelations[]>(`/public/companies/${id}/catalog`),

  catalog: (q?: string, category?: string) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (category) params.set("category", category)
    const qs = params.toString()
    return apiFetch<CatalogItemWithRelations[]>(
      `/public/catalog${qs ? `?${qs}` : ""}`,
    )
  },

  catalogItem: (id: number) =>
    apiFetch<CatalogItemWithRelations>(`/public/catalog/items/${id}`),

  rfqs: () => apiFetch<RfqWithRelations[]>("/public/rfqs"),
}
