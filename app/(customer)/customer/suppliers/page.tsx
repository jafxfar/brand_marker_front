"use client"

import { useMemo, useState } from "react"
import { Search, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { catalogCategories as mockCatalogCategories } from "@/lib/mock/catalog-categories"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicSuppliersQuery } from "@/hooks/api/use-public-query"
import {
  formatSupplierCatalogSummary,
  getActiveCatalogItemsCount,
  getSupplierCategories,
} from "@/lib/supplier-directory"
import { SupplierDirectoryCard } from "@/components/cabinet/suppliers/supplier-directory-card"
import type { CompanyWithRelations } from "@/types"

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

  const localCompanies = useMemo(() => {
    if (!hydrated || useApi) return []
    const byCategory = getSupplierCompaniesByCategory(categorySlug, (id) =>
      getCategoriesForSupplier(id),
    )
    if (!query.trim()) return byCategory
    const q = query.trim().toLowerCase()
    return byCategory.filter((c) => {
      const haystack = [
        c.title,
        c.description,
        ...getCategoriesForSupplier(c.id).map((cat) => cat.name),
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

  const companies: CompanyWithRelations[] = useApi
    ? (apiSuppliers ?? [])
    : localCompanies

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Store size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Каталог поставщиков</h1>
          <p className="text-sm text-muted-foreground">
            Поиск компаний и приглашение к заявке
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию, описанию, категории..."
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Поиск поставщиков"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setCategorySlug("")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
            categorySlug === ""
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Все
        </button>
        {categoryTabs.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategorySlug(c.slug)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
              categorySlug === c.slug
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {!hydrated || (useApi && isLoading) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
          Поставщики не найдены. Попробуйте изменить фильтры.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => {
            const items = useApi ? [] : getItemsBySupplier(company.id)
            const categories = useApi
              ? (company.profile?.industries.map((name, i) => ({
                  id: i,
                  parent_id: null,
                  name,
                  slug: name,
                })) ?? [])
              : getSupplierCategories(items)
            const activeCount = useApi
              ? (company.stats?.active_contracts ?? 0)
              : getActiveCatalogItemsCount(items)
            return (
              <SupplierDirectoryCard
                key={company.id}
                company={company}
                summary={formatSupplierCatalogSummary(company, activeCount, categories)}
                activeItemsCount={activeCount}
                categoryNames={categories.map((c) => c.name)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
