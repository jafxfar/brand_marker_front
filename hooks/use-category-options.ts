"use client"

import { useMemo } from "react"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import {
  flattenCategoryTree,
  offlineCatalogCategories,
  offlineRfqCategories,
  resolveCategoryLabel,
  toCatalogCategoryOptions,
  toRfqCategoryOptions,
  type CategoryOption,
} from "@/lib/category-options"
import type { Category } from "@/types"

export const useCategoryOptions = () => {
  const useApi = isApiEnabled()
  const { data: apiCategories, isLoading } = usePublicCategoriesQuery(useApi)

  const flatOptions: CategoryOption[] = useMemo(() => {
    if (!useApi || !apiCategories?.length) return []
    return flattenCategoryTree(apiCategories)
  }, [useApi, apiCategories])

  const catalogCategories: Category[] = useMemo(() => {
    if (!useApi) return offlineCatalogCategories
    if (!apiCategories?.length) return []
    return toCatalogCategoryOptions(apiCategories)
  }, [useApi, apiCategories])

  const rfqCategories = useMemo(() => {
    if (!useApi) return offlineRfqCategories
    if (!apiCategories?.length) return []
    return toRfqCategoryOptions(apiCategories)
  }, [useApi, apiCategories])

  const getRfqCategoryLabel = (categoryId: string): string =>
    resolveCategoryLabel(categoryId, flatOptions, useApi)

  const getCatalogCategoryName = (categoryId: number): string | undefined => {
    if (!useApi) {
      return offlineCatalogCategories.find((c) => c.id === categoryId)?.name
    }
    return flatOptions.find((c) => c.id === categoryId)?.name
  }

  return {
    useApi,
    isLoading: useApi && isLoading,
    catalogCategories,
    rfqCategories,
    flatOptions,
    getRfqCategoryLabel,
    getCatalogCategoryName,
  }
}
