"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, TrendingUp } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { ServiceCard } from "@/components/marketplace/service-card"
import { searchServices } from "@/lib/mock/marketplace-services"
import { getAllCategories } from "@/lib/mock/categories"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicCatalogQuery, usePublicCategoriesQuery } from "@/hooks/api/use-public-query"
import { mapCatalogItemToService, mapCategoryTreeToMarketplace } from "@/lib/marketplace-hybrid"
import { servicesUrl } from "@/lib/marketplace-routes"

export const ServicesPageContent = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const useApi = isApiEnabled()
  const { data: apiCatalog } = usePublicCatalogQuery(
    query || undefined,
    category || undefined,
    useApi,
  )
  const { data: apiCategories } = usePublicCategoriesQuery(useApi)
  const categories = useMemo(() => {
    if (!useApi) return getAllCategories()
    if (!apiCategories?.length) return []
    return mapCategoryTreeToMarketplace(apiCategories)
  }, [useApi, apiCategories])

  const services = useMemo(() => {
    if (!useApi) return searchServices(query, category || undefined)
    const items = apiCatalog?.items ?? []
    if (!items.length) return []
    return items.map((item) => mapCatalogItemToService(item))
  }, [query, category, useApi, apiCatalog])

  return (
    <PageShell>
      <section className="bg-canvas py-6 sm:py-8">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-4 lg:px-6">
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
            <div>
              <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink sm:text-[26px]">
                Каталог
              </h1>
              <p className="mt-0.5 text-[13.5px] text-mute sm:text-[14px]">
                {query
                  ? `Результаты по запросу «${query}»`
                  : "Товары и услуги от проверенных поставщиков"}
              </p>
            </div>
            <TrendingUp className="hidden size-5 text-brand-600 sm:block" aria-hidden />
          </div>

          <div className="mb-4 flex flex-wrap gap-2 sm:mb-5">
            <Link
              href={servicesUrl(query ? { q: query } : undefined)}
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-[14px] font-semibold leading-none transition ${
                !category
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-mute hover:text-ink"
              }`}
            >
              Все категории
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={servicesUrl({ ...(query ? { q: query } : {}), category: cat.id })}
                className={`inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-[14px] font-semibold leading-none transition ${
                  category === cat.id
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-mute hover:text-ink"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {services.length === 0 ? (
            <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-[#D5DAE1] bg-white px-6 py-14 text-center">
              <Search size={28} className="text-mute" />
              <b className="text-[17px] text-ink">Ничего не найдено</b>
              <p className="max-w-md text-[15px] text-mute">
                Попробуйте другой запрос или разместите заявку — поставщики пришлют цены сами.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
