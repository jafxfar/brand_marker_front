"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { catalogCategories as mockCatalogCategories } from "@/lib/mock/catalog-categories"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicSuppliersQuery } from "@/hooks/api/use-public-query"
import {
  formatPublicSupplierSummary,
  getActiveCatalogItemsCount,
  getSupplierCategories,
  isSupplierCompany,
  toPublicSupplierFromCompany,
} from "@/lib/supplier-directory"
import { SupplierDirectoryCard } from "@/components/cabinet/suppliers/supplier-directory-card"
import { Input } from "@/components/ui/input"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import type { PublicSupplier } from "@/types"

export default function SuppliersPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const [query, setQuery] = useState("")
  const [categorySlug, setCategorySlug] = useState("")

  const getSupplierCompaniesByCategory = useCompaniesStore((s) => s.getSupplierCompaniesByCategory)
  const getItemsBySupplier = useItemsStore((s) => s.getItemsBySupplier)

  const { data: apiCategories } = usePublicCategoriesQuery(useApi)
  const categoryTabs = useMemo(() => {
    if (!useApi || !apiCategories?.length) return mockCatalogCategories
    return mapCategoryTreeToMarketplace(apiCategories).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.label,
    }))
  }, [useApi, apiCategories])

  const { data: apiSuppliers, isLoading } = usePublicSuppliersQuery(
    query.trim() || undefined,
    categorySlug || undefined,
    hydrated && useApi,
  )

  const getCategoriesForSupplier = (companyId: number) =>
    getSupplierCategories(getItemsBySupplier(companyId))

  const localSuppliers = useMemo(() => {
    if (!hydrated || useApi) return [] as PublicSupplier[]
    const byCategory = getSupplierCompaniesByCategory(categorySlug, (id) =>
      getCategoriesForSupplier(id),
    ).filter(isSupplierCompany)
    const mapped = byCategory.map((company) => {
      const items = getItemsBySupplier(company.id)
      return toPublicSupplierFromCompany(
        company,
        getActiveCatalogItemsCount(items),
      )
    })
    if (!query.trim()) return mapped
    const q = query.trim().toLowerCase()
    return mapped.filter((supplier) => {
      const haystack = [
        supplier.display_name,
        supplier.description,
        ...supplier.industries,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [
    hydrated,
    useApi,
    query,
    categorySlug,
    getSupplierCompaniesByCategory,
    getItemsBySupplier,
  ])

  const suppliers: PublicSupplier[] = useApi
    ? (apiSuppliers ?? [])
    : localSuppliers

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  return (
    <PageFrame>
      <PageHeader
        title="Каталог поставщиков"
        description="Компании и физлица - поиск и приглашение к заявке"
      />

      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Поиск по названию, ФИО, описанию, категории..."
          className="pl-11"
          aria-label="Поиск поставщиков"
        />
      </div>

      <SegmentedControl
        value={categorySlug}
        options={[
          { value: "", label: "Все" },
          ...categoryTabs.map((c) => ({ value: c.slug, label: c.name })),
        ]}
        onChange={setCategorySlug}
        ariaLabel="Категория поставщиков"
      />

      {!hydrated || (useApi && isLoading) ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            title="Поставщики не найдены"
            description="Попробуйте изменить фильтры"
          />
        </PageSurface>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <SupplierDirectoryCard
              key={supplier.actor_id}
              supplier={supplier}
              summary={formatPublicSupplierSummary(supplier)}
              categoryNames={supplier.industries}
            />
          ))}
        </div>
      )}
    </PageFrame>
  )
}
