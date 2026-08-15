"use client"

import Link from "next/link"
import { BadgeCheck, Clock, MapPin, Star, Users } from "lucide-react"
import { PageShell } from "@/components/marketplace/page-shell"
import { getPerformer } from "@/lib/mock/marketplace-performers"
import { getServicesByCategory } from "@/lib/mock/marketplace-services"
import { getIcon } from "@/lib/icon-map"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicSupplierQuery, usePublicSupplierCatalogQuery } from "@/hooks/api/use-public-query"
import { mapPublicSupplierToPerformer, mapCatalogItemToService } from "@/lib/marketplace-hybrid"
import { loginRedirect, performersUrl, serviceUrl } from "@/lib/marketplace-routes"
import type { MarketplacePerformer } from "@/types/marketplace"

type PerformerDetailContentProps = {
  performerId: number
}

export const PerformerDetailContent = ({ performerId }: PerformerDetailContentProps) => {
  const useApi = isApiEnabled()
  const mockPerformer = useApi ? null : getPerformer(performerId)
  const { data: apiSupplier, isLoading } = usePublicSupplierQuery(
    performerId,
    useApi,
  )
  const { data: apiCatalog = [] } = usePublicSupplierCatalogQuery(
    performerId,
    useApi && Boolean(apiSupplier),
  )

  const performer: MarketplacePerformer | null = useApi
    ? (apiSupplier ? mapPublicSupplierToPerformer(apiSupplier) : null)
    : mockPerformer

  if (useApi && isLoading) {
    return (
      <PageShell>
        <div className="max-w-[900px] mx-auto px-6 py-16 animate-pulse">
          <div className="h-48 bg-secondary rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  if (!performer) {
    return (
      <PageShell>
        <div className="max-w-[900px] mx-auto px-6 py-16 text-center">
          <p className="text-lg font-bold text-foreground">Исполнитель не найден</p>
          <Link href={performersUrl()} className="text-primary font-semibold hover:underline mt-2 inline-block">
            К каталогу
          </Link>
        </div>
      </PageShell>
    )
  }

  const Icon = getIcon(performer.icon)
  const services = useApi
    ? apiCatalog.map((item) =>
        mapCatalogItemToService(item, null, apiSupplier ?? undefined),
      )
    : getServicesByCategory(performer.categoryId).filter(
        (s) => s.providerId === performer.id,
      )

  return (
    <PageShell>
      <section className="bg-background py-9">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
            <span>/</span>
            <Link href={performersUrl()} className="hover:text-primary transition-colors">Исполнители</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{performer.name}</span>
          </div>

          <div className="bg-white border border-border rounded-2xl p-8">
            <div className="flex items-start gap-5">
              <div className={`${performer.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                {performer.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-foreground">{performer.name}</h1>
                  {performer.verified && <BadgeCheck size={20} className="text-primary" />}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Icon size={14} />
                  <span>{performer.category}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{performer.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 py-6 border-y border-border">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-sm font-bold">{performer.rating}</div>
                  <div className="text-xs text-muted-foreground">{performer.reviews} отзывов</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-bold">{performer.clients}</div>
                  <div className="text-xs text-muted-foreground">клиентов</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-bold">{performer.years}</div>
                  <div className="text-xs text-muted-foreground">на рынке</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-bold">{performer.city}</div>
                  <div className="text-xs text-muted-foreground">город</div>
                </div>
              </div>
            </div>

            {services.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-foreground mb-3">Услуги компании</h2>
                <div className="space-y-2">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={serviceUrl(service.id)}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <span className="text-sm font-semibold text-foreground">{service.title}</span>
                      <span className="text-sm font-bold text-primary">{service.price}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Link
                href={loginRedirect(`/customer/rfqs/new?performer=${performer.id}`)}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Пригласить на заказ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
