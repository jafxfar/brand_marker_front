"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Award } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { PerformerCard } from "@/components/marketplace/performer-card"
import { filterPerformers } from "@/lib/mock/marketplace-performers"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicSuppliersQuery } from "@/hooks/api/use-public-query"
import { mergeByKey, mapPublicSupplierToPerformer } from "@/lib/marketplace-hybrid"

export const PerformersPageContent = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const verified = searchParams.get("verified") === "true"
  const featured = searchParams.get("featured") === "true"
  const scope = searchParams.get("scope")
  const useApi = isApiEnabled()
  const { data: apiSuppliers } = usePublicSuppliersQuery(
    query || undefined,
    undefined,
    useApi,
  )

  const performers = useMemo(() => {
    if (!useApi) return filterPerformers({ q: query, verified, featured, scope: scope ?? undefined })
    if (!apiSuppliers?.length) return []
    const apiPerformers = apiSuppliers.map(mapPublicSupplierToPerformer)
    const q = query.trim().toLowerCase()
    return apiPerformers.filter((p) => {
      if (verified && !p.verified) return false
      if (featured && !p.featured) return false
      if (scope === "worldwide" && !p.worldwide) return false
      if (!q) return true
      const haystack = [p.name, p.category, p.city, ...p.specialties].join(" ").toLowerCase()
      return haystack.includes(q)
    })
  }, [query, verified, featured, scope, useApi, apiSuppliers])

  const pageTitle = scope === "worldwide"
    ? "Исполнители по всему миру"
    : featured
      ? "ТОП исполнители"
      : verified
        ? "Проверенные исполнители"
        : "Каталог исполнителей"

  const pageSubtitle = scope === "worldwide"
    ? "Компании с международным опытом и удалённой работой"
    : "Проверенные компании с высоким рейтингом"

  return (
    <PageShell>
      <section className="bg-white border-b border-border py-9">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Award size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
            </div>
          </div>

          {performers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-secondary/30 p-12 text-center">
              <p className="text-sm text-muted-foreground">Исполнители не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {performers.map((performer) => (
                <PerformerCard key={performer.id} performer={performer} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
