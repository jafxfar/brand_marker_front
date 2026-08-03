"use client"

import { useState } from "react"
import Link from "next/link"
import { BadgeCheck, Flag, MapPin, Star } from "lucide-react"
import { ReportItemDialog } from "@/components/catalog/report-item-dialog"
import { PageShell } from "@/components/marketplace/page-shell"
import { Button } from "@/components/ui/button"
import { getService } from "@/lib/mock/marketplace-services"
import { getCategory } from "@/lib/mock/categories"
import { getIcon } from "@/lib/icon-map"
import { isApiEnabled } from "@/lib/api/config"
import { usePublicCatalogItemQuery } from "@/hooks/api/use-public-query"
import { mapCatalogItemToService } from "@/lib/marketplace-hybrid"
import {
  categoryUrl,
  loginRedirect,
  performerUrl,
  servicesUrl,
} from "@/lib/marketplace-routes"
import { tokenStorage } from "@/lib/api/client"
import type { MarketplaceService } from "@/types/marketplace"

type ServiceDetailContentProps = {
  serviceId: number
}

export const ServiceDetailContent = ({ serviceId }: ServiceDetailContentProps) => {
  const useApi = isApiEnabled()
  const mockService = getService(serviceId)
  const [reportOpen, setReportOpen] = useState(false)
  const { data: apiItem, isLoading } = usePublicCatalogItemQuery(
    serviceId,
    useApi && !mockService,
  )
  const isAuthenticated = Boolean(tokenStorage.getAccess())

  const service: MarketplaceService | null = mockService
    ?? (apiItem ? mapCatalogItemToService(apiItem) : null)

  if (useApi && isLoading && !mockService) {
    return (
      <PageShell>
        <div className="max-w-[900px] mx-auto px-6 py-16 animate-pulse">
          <div className="h-64 bg-secondary rounded-2xl" />
        </div>
      </PageShell>
    )
  }

  if (!service) {
    return (
      <PageShell>
        <div className="max-w-[900px] mx-auto px-6 py-16 text-center">
          <p className="text-lg font-bold text-foreground">Услуга не найдена</p>
          <Link href={servicesUrl()} className="text-primary font-semibold hover:underline mt-2 inline-block">
            К каталогу
          </Link>
        </div>
      </PageShell>
    )
  }

  const category = getCategory(service.categoryId)
  const Icon = getIcon(service.icon)

  return (
    <PageShell>
      <section className="bg-background py-9">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
            <span>/</span>
            <Link href={servicesUrl()} className="hover:text-primary transition-colors">Услуги</Link>
            <span>/</span>
            <span className="text-foreground font-medium line-clamp-1">{service.title}</span>
          </div>

          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className={`${service.iconBg} p-8 flex items-center gap-4`}>
              <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
                <Icon size={32} className={service.iconColor} />
              </div>
              <div>
                {service.badge && (
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${service.badge.className}`}>
                    {service.badge.label}
                  </span>
                )}
                <h1 className="text-2xl font-black text-foreground">{service.title}</h1>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>

              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-lg font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Исполнитель</div>
                  <Link href={performerUrl(service.providerId)} className="text-sm font-semibold text-foreground hover:text-primary flex items-center gap-1">
                    {service.provider}
                    {service.verified && <BadgeCheck size={14} className="text-primary" />}
                  </Link>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Город</div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    <MapPin size={13} className="text-muted-foreground" />
                    {service.city}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Рейтинг</div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    {service.rating} ({service.reviews})
                  </div>
                </div>
                {category && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Категория</div>
                    <Link href={categoryUrl(category.slug)} className="text-sm font-semibold hover:text-primary transition-colors">
                      {category.label}
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-2xl font-black text-primary">{service.price}</div>
                <div className="flex flex-wrap gap-3">
                  {useApi && !mockService && (
                    isAuthenticated ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setReportOpen(true)}
                        aria-label="Пожаловаться на позицию"
                      >
                        <Flag aria-hidden="true" />
                        Пожаловаться
                      </Button>
                    ) : (
                      <Button asChild variant="outline">
                        <Link href={loginRedirect(`/services/${service.id}`)}>
                          <Flag aria-hidden="true" />
                          Пожаловаться
                        </Link>
                      </Button>
                    )
                  )}
                  <Link
                    href={performerUrl(service.providerId)}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:border-primary/30 transition-colors"
                  >
                    Профиль исполнителя
                  </Link>
                  <Link
                    href={loginRedirect(`/customer/rfqs/new?service=${service.id}`)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
                  >
                    Отправить запрос
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {useApi && !mockService && (
        <ReportItemDialog
          itemId={serviceId}
          itemTitle={service.title}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      )}
    </PageShell>
  )
}
