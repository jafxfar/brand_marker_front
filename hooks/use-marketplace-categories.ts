"use client"

import { useMemo } from "react"
import { getAllCategories } from "@/lib/mock/categories"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mergeByKey, mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"
import type { MarketplaceCategory } from "@/types/marketplace"

export const useMarketplaceCategories = () => {
  const useApi = isApiEnabled()
  const { data: apiCategories, isLoading } = usePublicCategoriesQuery(useApi)
  const mockCategories = getAllCategories()

  const categories = useMemo(() => {
    if (!useApi || !apiCategories?.length) return mockCategories
    const apiMapped = mapCategoryTreeToMarketplace(apiCategories)
    return mergeByKey(mockCategories, apiMapped, "slug")
  }, [useApi, apiCategories, mockCategories])

  return {
    categories,
    isLoading: useApi && isLoading,
    isApiEnabled: useApi,
  }
}

export const filterCategoriesByQuery = (
  categories: MarketplaceCategory[],
  query: string,
  limit = 5,
): MarketplaceCategory[] => {
  const q = query.trim().toLowerCase()
  if (!q) return categories.slice(0, limit)

  const results: MarketplaceCategory[] = []
  for (const category of categories) {
    if (category.label.toLowerCase().includes(q)) {
      results.push(category)
      continue
    }
    const matchingSubs = category.subcategories.filter((sub) =>
      sub.label.toLowerCase().includes(q),
    )
    if (matchingSubs.length > 0) {
      results.push({ ...category, subcategories: matchingSubs })
    }
  }
  return results.slice(0, limit)
}
