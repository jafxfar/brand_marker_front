"use client"

import { useRouter } from "next/navigation"
import { CompanyWizard } from "@/components/company/company-wizard"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import {
  useCreateSupplierCompanyMutation,
  useSupplierCompaniesQuery,
} from "@/hooks/api/use-supplier-companies-query"
import { useSupplierSubscriptionQuery } from "@/hooks/api/use-supplier-subscription-query"
import { getCompanyLimit } from "@/lib/subscription"
import type { CompanyWizardInput } from "@/types"

export default function SupplierCompanyNewPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const createCompany = useCompaniesStore((s) => s.createCompany)
  const canUserCreateCompany = useCompaniesStore((s) => s.canUserCreateCompany)
  const getOwnedCompaniesCount = useCompaniesStore((s) => s.getOwnedCompaniesCount)
  const localPlan = useSubscriptionStore((s) => s.plan)
  const useApi = isApiEnabled()
  const { data: apiCompanies } = useSupplierCompaniesQuery(hydrated && useApi)
  const { data: apiSub } = useSupplierSubscriptionQuery(hydrated && useApi)
  const createMutation = useCreateSupplierCompanyMutation()

  if (!hydrated || !user) return null

  const plan = useApi
    ? ((apiSub?.is_active ? apiSub.plan : "none") as typeof localPlan)
    : localPlan

  const ownedCount = useApi
    ? (apiCompanies ?? []).filter((c) => c.owner_id === user.userId).length
    : getOwnedCompaniesCount(user.userId)
  const limit = getCompanyLimit(plan)
  const canCreate = useApi
    ? limit === null || ownedCount < limit
    : canUserCreateCompany(user.userId, plan)

  const handleSubmit = async (data: CompanyWizardInput) => {
    if (useApi) {
      await createMutation.mutateAsync(data)
      router.push("/supplier/company")
      return
    }
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
