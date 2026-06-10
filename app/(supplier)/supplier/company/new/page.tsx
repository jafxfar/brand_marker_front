"use client"

import { useRouter } from "next/navigation"
import { CompanyWizard } from "@/components/company/company-wizard"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getCompanyLimit } from "@/lib/subscription"
import type { CompanyWizardInput } from "@/types"

export default function SupplierCompanyNewPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const createCompany = useCompaniesStore((s) => s.createCompany)
  const canUserCreateCompany = useCompaniesStore((s) => s.canUserCreateCompany)
  const getOwnedCompaniesCount = useCompaniesStore((s) => s.getOwnedCompaniesCount)
  const plan = useSubscriptionStore((s) => s.plan)

  if (!hydrated || !user) return null

  const ownedCount = getOwnedCompaniesCount(user.userId)
  const limit = getCompanyLimit(plan)
  const canCreate = canUserCreateCompany(user.userId, plan)

  const handleSubmit = (data: CompanyWizardInput) => {
    createCompany(data, { userId: user.userId, actorType: "supplier" })
    router.push("/supplier/company")
  }

  return (
    <CompanyWizard
      actorType="supplier"
      basePath="/supplier/company"
      limitBlocked={!canCreate}
      limitMessage={
        limit !== null
          ? `Вы создали ${ownedCount} из ${limit} доступных компаний на текущем тарифе.`
          : "Достигнут лимит компаний."
      }
      subscriptionHref="/supplier/subscription"
      onSubmit={handleSubmit}
    />
  )
}
