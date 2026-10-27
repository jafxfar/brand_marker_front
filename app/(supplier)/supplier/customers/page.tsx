"use client"

import Link from "next/link"
import { ChevronRight, Star, Users } from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import { useSupplierReviewsQuery } from "@/hooks/api/use-reviews-query"
import { getActorId } from "@/lib/auth-display"
import { formatCount, formatPrice } from "@/lib/format"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import type { ContractWithRelations, Review } from "@/types"

interface CustomerGroup {
  id: number
  name: string
  contractCount: number
  totalAmount: number
  latestContractId: number
  rating: number | null
  reviewsCount: number
}

const avgRating = (reviews: Review[]) => {
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

const groupCustomers = (
  contracts: ContractWithRelations[],
  getName: (buyerActorId: number) => string,
  reviewsAboutBuyer: Map<number, Review[]>,
): CustomerGroup[] => {
  const groups = new Map<number, CustomerGroup>()

  for (const contract of contracts) {
    const buyerReviews = reviewsAboutBuyer.get(contract.buyer_actor_id) ?? []
    const existing = groups.get(contract.buyer_actor_id)
    if (existing) {
      existing.contractCount += 1
      existing.totalAmount += contract.agreed_amount
      if (contract.id > existing.latestContractId) {
        existing.latestContractId = contract.id
      }
      continue
    }

    groups.set(contract.buyer_actor_id, {
      id: contract.buyer_actor_id,
      name: getName(contract.buyer_actor_id),
      contractCount: 1,
      totalAmount: contract.agreed_amount,
      latestContractId: contract.id,
      rating: avgRating(buyerReviews),
      reviewsCount: buyerReviews.length,
    })
  }

  return Array.from(groups.values()).sort((a, b) => b.totalAmount - a.totalAmount)
}

export default function SupplierCustomersPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsForSupplier = useContractsStore((s) => s.getContractsForSupplier)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const { data: apiContracts, isLoading } = useSupplierContractsQuery(
    hydrated && useApi,
    { pageSize: 100 },
  )
  const { data: givenReviewsPage } = useSupplierReviewsQuery(hydrated && useApi)

  const getBuyerName = (buyerActorId: number): string =>
    getCompany(buyerActorId)?.title ?? `Заказчик #${buyerActorId}`

  const contracts: ContractWithRelations[] = useApi
    ? ((apiContracts?.items ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsForSupplier(actorId)
      : []

  // Рейтинг: ваши отзывы о заказчике; иначе rating компании, если есть в сторе.
  const reviewsAboutBuyer = new Map<number, Review[]>()
  for (const review of givenReviewsPage?.items ?? []) {
    const list = reviewsAboutBuyer.get(review.target_actor_id) ?? []
    list.push(review)
    reviewsAboutBuyer.set(review.target_actor_id, list)
  }

  const customers = groupCustomers(
    contracts,
    getBuyerName,
    reviewsAboutBuyer,
  ).map((customer) => {
    if (customer.rating != null) return customer
    const companyRating = getCompany(customer.id)?.rating
    if (companyRating && companyRating > 0) {
      return { ...customer, rating: companyRating }
    }
    return customer
  })

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="mb-6 h-10 w-1/3 rounded bg-secondary" />
        <div className="h-32 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Заказчики"
        description="Контрагенты по вашим сделкам и их рейтинг"
      />

      {customers.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<Users size={32} />}
            title="Заказчиков пока нет"
            description="Заказчики появятся после первых сделок"
          />
        </PageSurface>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Users size={18} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {customer.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatCount(customer.contractCount, "сделка", "сделки", "сделок")} ·{" "}
                  {formatPrice(customer.totalAmount)}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {customer.rating != null ? (
                    <>
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground">
                        {customer.rating.toFixed(1)}
                      </span>
                      {customer.reviewsCount > 0 ? (
                        <span className="text-muted-foreground">
                          ({customer.reviewsCount})
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Нет оценок</span>
                  )}
                </div>
              </div>
              <Link
                href={`/supplier/contracts/${customer.latestContractId}`}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                aria-label={`Открыть сделки с ${customer.name}`}
              >
                Сделки <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageFrame>
  )
}
