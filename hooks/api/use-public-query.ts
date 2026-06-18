import { useQuery } from "@tanstack/react-query"
import { publicApi } from "@/lib/api/public"
import { isApiEnabled } from "@/lib/api/config"

export const publicKeys = {
  all: ["public"] as const,
  categories: () => [...publicKeys.all, "categories"] as const,
  suppliers: (q?: string, category?: string) =>
    [...publicKeys.all, "suppliers", q ?? "", category ?? ""] as const,
  company: (id: number) => [...publicKeys.all, "company", id] as const,
  companyCatalog: (id: number) => [...publicKeys.all, "company-catalog", id] as const,
  companyReviews: (id: number) => [...publicKeys.all, "company-reviews", id] as const,
  catalog: (q?: string, category?: string) =>
    [...publicKeys.all, "catalog", q ?? "", category ?? ""] as const,
  catalogItem: (id: number) => [...publicKeys.all, "catalog-item", id] as const,
  rfqs: () => [...publicKeys.all, "rfqs"] as const,
}

export const usePublicCategoriesQuery = (enabled = true) =>
  useQuery({
    queryKey: publicKeys.categories(),
    queryFn: () => publicApi.categories(),
    enabled: enabled && isApiEnabled(),
    staleTime: 5 * 60 * 1000,
  })

export const usePublicSuppliersQuery = (
  q?: string,
  category?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: publicKeys.suppliers(q, category),
    queryFn: () => publicApi.suppliers(q, category),
    enabled: enabled && isApiEnabled(),
  })

export const usePublicCompanyQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: publicKeys.company(id),
    queryFn: () => publicApi.company(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const usePublicCompanyCatalogQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: publicKeys.companyCatalog(id),
    queryFn: () => publicApi.companyCatalog(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const usePublicCompanyReviewsQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: publicKeys.companyReviews(id),
    queryFn: () => publicApi.companyReviews(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const usePublicCatalogQuery = (
  q?: string,
  category?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: publicKeys.catalog(q, category),
    queryFn: () => publicApi.catalog(q, category),
    enabled: enabled && isApiEnabled(),
  })

export const usePublicCatalogItemQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: publicKeys.catalogItem(id),
    queryFn: () => publicApi.catalogItem(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const usePublicRfqsQuery = (enabled = true) =>
  useQuery({
    queryKey: publicKeys.rfqs(),
    queryFn: () => publicApi.rfqs(),
    enabled: enabled && isApiEnabled(),
  })
