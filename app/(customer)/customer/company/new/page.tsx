"use client"

import { useRouter } from "next/navigation"
import { CompanyWizard } from "@/components/company/company-wizard"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import {
  useCreateBuyerCompanyMutation,
  useBuyerCompaniesQuery,
} from "@/hooks/api/use-buyer-companies-query"
import type { CompanyWizardInput } from "@/types"

export default function CustomerCompanyNewPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const createCompany = useCompaniesStore((s) => s.createCompany)
  const useApi = isApiEnabled()
  const { data: apiCompanies } = useBuyerCompaniesQuery(hydrated && useApi)
  const createMutation = useCreateBuyerCompanyMutation()

  if (!hydrated || !user) return null

  const ownedCount = useApi
    ? (apiCompanies ?? []).filter((c) => c.owner_id === user.userId).length
    : useCompaniesStore.getState().getOwnedCompaniesCount(user.userId)

  const handleSubmit = async (data: CompanyWizardInput) => {
    if (useApi) {
      await createMutation.mutateAsync(data)
      router.push("/customer/company")
      return
    }
    createCompany(data, { userId: user.userId, actorType: "buyer" })
    router.push("/customer/company")
  }

  return (
    <CompanyWizard
      actorType="buyer"
      basePath="/customer/company"
      limitBlocked={false}
      limitMessage={
        ownedCount > 0
          ? `У вас ${ownedCount} компаний заказчика.`
          : undefined
      }
      onSubmit={handleSubmit}
    />
  )
}
