"use client"

import { Star } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useBuyerReviewsQuery } from "@/hooks/api/use-reviews-query"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import { useSupplierActorName } from "@/hooks/api/use-supplier-name"
import { ReviewsGivenTable } from "@/components/cabinet/reviews/reviews-given-table"
import type { ContractWithRelations } from "@/types"

export default function BuyerReviewsPage() {
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const useApi = isApiEnabled()
  const getReviewsGivenByBuyer = useCompaniesStore((s) => s.getReviewsGivenByBuyer)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getContractLocal = useContractsStore((s) => s.getContract)

  const { data: apiReviews = [], isLoading } = useBuyerReviewsQuery(hydrated && useApi)
  const { data: apiContracts = [] } = useContractsQuery(hydrated && useApi)

  const localReviews = hydrated ? getReviewsGivenByBuyer(actorId) : []
  const reviews = useApi ? apiReviews : localReviews

  const supplierIds = [
    ...new Set(reviews.map((r) => r.target_actor_id)),
  ]
  const resolveName = useSupplierActorName(supplierIds)

  const getContractTitle = (contractId: number) => {
    if (useApi) {
      const contract = (apiContracts as ContractWithRelations[]).find(
        (c) => c.id === contractId,
      )
      return contract?.title ?? `Контракт #${contractId}`
    }
    return getContractLocal(contractId)?.title ?? `Контракт #${contractId}`
  }

  const getSupplierName = (supplierActorId: number) => {
    if (useApi) return resolveName(supplierActorId)
    return getCompany(supplierActorId)?.title ?? "Поставщик"
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Star size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Мои отзывы</h1>
          <p className="text-sm text-muted-foreground">Отзывы, которые вы оставили поставщикам</p>
        </div>
      </div>

      <section className="bg-white border border-border rounded-2xl p-6">
        {useApi && isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Загрузка…</p>
        ) : (
          <ReviewsGivenTable
            reviews={reviews}
            getSupplierName={getSupplierName}
            getContractTitle={getContractTitle}
          />
        )}
      </section>
    </div>
  )
}
