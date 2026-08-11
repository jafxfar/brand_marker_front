"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { CategoryCard } from "@/components/marketplace/category-card"
import { getAllCategories } from "@/lib/mock/categories"
import { servicesUrl } from "@/lib/marketplace-routes"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mergeByKey, mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"

export default function CategoriesPage() {
  const useApi = isApiEnabled()
  const { data: apiCategories } = usePublicCategoriesQuery(useApi)
  const mockCategories = getAllCategories()

  const categories = useMemo(() => {
    if (!useApi) return mockCategories
    if (!apiCategories?.length) return []
    return mapCategoryTreeToMarketplace(apiCategories)
  }, [useApi, apiCategories, mockCategories])

  return (
    <PageShell>
      <section className="bg-white border-b border-border py-9">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-foreground">Категории услуг</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Выберите направление и найдите подходящего исполнителя
              </p>
            </div>
            <Link
              href={servicesUrl()}
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              Все услуги <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
