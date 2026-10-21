"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ReportItemDialog } from "@/components/catalog/report-item-dialog"
import { PageShell } from "@/components/marketplace/page-shell"
import { CatalogItemGallery } from "@/components/marketplace/catalog-item-detail/catalog-item-gallery"
import { CatalogItemPricing } from "@/components/marketplace/catalog-item-detail/catalog-item-pricing"
import { CatalogItemSpecs } from "@/components/marketplace/catalog-item-detail/catalog-item-specs"
import { CatalogItemSellerCard } from "@/components/marketplace/catalog-item-detail/catalog-item-seller-card"
import { CatalogItemReviews } from "@/components/marketplace/catalog-item-detail/catalog-item-reviews"
import { CatalogItemBuyCard } from "@/components/marketplace/catalog-item-detail/catalog-item-buy-card"
import { getService } from "@/lib/mock/marketplace-services"
import { mockCatalogItems } from "@/lib/mock/items"
import { mockCompanies } from "@/lib/mock/companies"
import { toPublicSupplierFromCompany } from "@/lib/supplier-directory"
import { isApiEnabled } from "@/lib/api/config"
import {
  usePublicCatalogItemQuery,
  usePublicSupplierQuery,
  usePublicSupplierReviewsQuery,
} from "@/hooks/api/use-public-query"
import {
  categoryUrl,
  performerUrl,
  servicesUrl,
} from "@/lib/marketplace-routes"
import { catalogItemTypeLabel } from "@/lib/item-display"
import { tokenStorage } from "@/lib/api/client"
import type {
  CatalogItemWithRelations,
  PublicSupplier,
  Review,
} from "@/types"
import type { MarketplaceService } from "@/types/marketplace"

type ServiceDetailContentProps = {
  serviceId: number
}

const marketplaceServiceToItem = (
  service: MarketplaceService,
): CatalogItemWithRelations => ({
  id: service.id,
  actor_id: service.providerId,
  type: "service",
  category_id: 0,
  title: service.title,
  description: service.description,
  status: "active",
  created_at: new Date().toISOString(),
  category: service.categoryId
    ? {
        id: 0,
        parent_id: null,
        name: service.categoryId,
        slug: service.categoryId,
      }
    : undefined,
  attributes: service.tags.map((tag, index) => ({
    id: index + 1,
    item_id: service.id,
    name: "Тег",
    value: tag,
    value_type: "text",
    sort_order: index,
  })),
  pricing: null,
  media: [],
  stats: null,
})

const marketplaceServiceToSupplier = (
  service: MarketplaceService,
): PublicSupplier => ({
  actor_id: service.providerId,
  kind: "company",
  display_name: service.provider,
  company_id: service.providerId,
  city: service.city,
  country: null,
  description: null,
  website: null,
  rating: service.rating,
  verification_status: service.verified ? "verified" : "pending",
  reviews_count: service.reviews,
  industries: [],
  active_catalog_count: 0,
  trust_level: "basic",
  success_rate: null,
})

export const ServiceDetailContent = ({ serviceId }: ServiceDetailContentProps) => {
  const useApi = isApiEnabled()
  const [reportOpen, setReportOpen] = useState(false)
  const isAuthenticated = Boolean(tokenStorage.getAccess())

  const { data: apiItem, isLoading: itemLoading } = usePublicCatalogItemQuery(
    serviceId,
    useApi,
  )
  const { data: apiSupplier, isLoading: supplierLoading } = usePublicSupplierQuery(
    apiItem?.actor_id ?? 0,
    useApi && Boolean(apiItem?.actor_id),
  )
  const { data: reviewsPage, isLoading: reviewsLoading } =
    usePublicSupplierReviewsQuery(
      apiItem?.actor_id ?? 0,
      useApi && Boolean(apiItem?.actor_id),
      { page: 1, pageSize: 20 },
    )

  const mockBundle = useMemo(() => {
    if (useApi) return null
    const catalogItem = mockCatalogItems.find((item) => item.id === serviceId)
    if (catalogItem) {
      const company = mockCompanies.find((c) => c.id === catalogItem.actor_id)
      const supplier = company
        ? toPublicSupplierFromCompany(company, mockCatalogItems.filter((i) => i.actor_id === catalogItem.actor_id).length)
        : marketplaceServiceToSupplier({
            id: catalogItem.id,
            title: catalogItem.title,
            description: catalogItem.description ?? "",
            provider: `Поставщик #${catalogItem.actor_id}`,
            providerId: catalogItem.actor_id,
            city: "—",
            rating: 4.5,
            reviews: 0,
            price: "",
            tags: [],
            verified: false,
            badge: null,
            icon: "Package",
            iconBg: "",
            iconColor: "",
            saves: 0,
            views: "0",
            categoryId: catalogItem.category?.slug ?? "",
          })
      return {
        item: catalogItem,
        supplier,
        reviews: (company?.reviews ?? []) as Review[],
      }
    }

    const marketplace = getService(serviceId)
    if (!marketplace) return null
    return {
      item: marketplaceServiceToItem(marketplace),
      supplier: marketplaceServiceToSupplier(marketplace),
      reviews: [] as Review[],
    }
  }, [serviceId, useApi])

  const item = useApi ? (apiItem ?? null) : (mockBundle?.item ?? null)
  const supplier = useApi
    ? (apiSupplier ?? null)
    : (mockBundle?.supplier ?? null)
  const reviews = useApi
    ? (reviewsPage?.items ?? [])
    : (mockBundle?.reviews ?? [])

  if (useApi && (itemLoading || (apiItem && supplierLoading))) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 rounded bg-secondary" />
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr_280px]">
              <div className="aspect-square rounded-xl bg-secondary" />
              <div className="space-y-4">
                <div className="h-8 rounded bg-secondary" />
                <div className="h-24 rounded bg-secondary" />
                <div className="h-32 rounded bg-secondary" />
              </div>
              <div className="h-64 rounded-xl bg-secondary" />
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  if (!item || !supplier) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-6">
          <p className="text-lg font-bold text-foreground">Позиция не найдена</p>
          <Link
            href={servicesUrl()}
            className="mt-2 inline-block font-semibold text-primary hover:underline"
          >
            К каталогу
          </Link>
        </div>
      </PageShell>
    )
  }

  const typeLabel = catalogItemTypeLabel[item.type]
  const catalogLabel = item.type === "product" ? "Товары" : "Услуги"
  const categoryLabel = item.category?.name
  const categorySlug = item.category?.slug

  return (
    <PageShell>
      <section className="bg-background py-6 sm:py-9">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav
            className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
            aria-label="Навигация"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              Главная
            </Link>
            <span>/</span>
            <Link href={servicesUrl()} className="transition-colors hover:text-primary">
              {catalogLabel}
            </Link>
            {categorySlug && categoryLabel && (
              <>
                <span>/</span>
                <Link
                  href={categoryUrl(categorySlug)}
                  className="transition-colors hover:text-primary"
                >
                  {categoryLabel}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="line-clamp-1 font-medium text-foreground">{item.title}</span>
          </nav>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(240px,280px)] lg:items-start">
            <div className="md:col-span-1">
              <CatalogItemGallery media={item.media} title={item.title} />
            </div>

            <div className="min-w-0 space-y-5 md:col-span-1">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {typeLabel}
                </span>
                <h1 className="mt-1 text-xl font-black leading-snug text-foreground sm:text-2xl">
                  {item.title}
                </h1>
                <Link
                  href={performerUrl(supplier.actor_id)}
                  className="mt-2 inline-block text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {supplier.display_name}
                </Link>
              </div>

              <CatalogItemPricing pricing={item.pricing} />

              {item.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}

              {item.attributes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {[...item.attributes]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .slice(0, 6)
                    .map((attr) => (
                      <span
                        key={attr.id}
                        className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {attr.name}: {attr.value}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <CatalogItemBuyCard
                itemId={item.id}
                supplier={supplier}
                isAuthenticated={isAuthenticated}
                canReport={useApi}
                onReport={() => setReportOpen(true)}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
            <CatalogItemSellerCard supplier={supplier} />
            <div className="space-y-5">
              <CatalogItemSpecs attributes={item.attributes} />
              <CatalogItemReviews
                reviews={reviews}
                isLoading={useApi && reviewsLoading}
              />
            </div>
          </div>
        </div>
      </section>

      {useApi && (
        <ReportItemDialog
          itemId={serviceId}
          itemTitle={item.title}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      )}
    </PageShell>
  )
}
