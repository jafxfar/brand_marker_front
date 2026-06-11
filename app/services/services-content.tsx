"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, TrendingUp } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { ServiceCard } from "@/components/marketplace/service-card"
import { searchServices } from "@/lib/mock/marketplace-services"
import { getAllCategories } from "@/lib/mock/categories"
import { servicesUrl } from "@/lib/marketplace-routes"

export const ServicesPageContent = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const categories = getAllCategories()

  const services = useMemo(
    () => searchServices(query, category || undefined),
    [query, category],
  )

  return (
    <PageShell>
      <section className="bg-background py-9">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Каталог услуг</h1>
              <p className="text-sm text-muted-foreground">
                {query ? `Результаты по запросу «${query}»` : "Лучшие предложения от проверенных исполнителей"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href={servicesUrl(query ? { q: query } : undefined)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                !category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              Все категории
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={servicesUrl({ ...(query ? { q: query } : {}), category: cat.id })}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-12 text-center">
              <Search size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">По вашему запросу услуги не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
