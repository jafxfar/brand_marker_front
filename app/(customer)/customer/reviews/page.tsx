"use client"

import { Star } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { ReviewsGivenTable } from "@/components/cabinet/reviews/reviews-given-table"

export default function BuyerReviewsPage() {
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getReviewsGivenByBuyer = useCompaniesStore((s) => s.getReviewsGivenByBuyer)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const getContract = useContractsStore((s) => s.getContract)

  const reviews = hydrated ? getReviewsGivenByBuyer(actorId) : []

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
        <ReviewsGivenTable
          reviews={reviews}
          getSupplierName={(id) => getCompany(id)?.title ?? "Поставщик"}
          getContractTitle={(id) => getContract(id)?.title ?? `Контракт #${id}`}
        />
      </section>
    </div>
  )
}
