"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CompanyWizard } from "@/components/company/company-wizard"
import {
  useCreateSupplierCompanyMutation,
  useSupplierCompaniesQuery,
} from "@/hooks/api/use-supplier-companies-query"
import { useSupplierSubscriptionQuery } from "@/hooks/api/use-supplier-subscription-query"
import { useHydrated } from "@/hooks/use-hydrated"
import { getApiErrorMessage } from "@/lib/api/client"
import { isApiEnabled } from "@/lib/api/config"
import { getCompanyLimit } from "@/lib/subscription"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import type { CompanyWizardInput } from "@/types"

export default function SupplierCompanyNewPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const createLocal = useCompaniesStore((s) => s.createCompany)
  const canUserCreateCompany = useCompaniesStore((s) => s.canUserCreateCompany)
  const getOwnedCompaniesCount = useCompaniesStore((s) => s.getOwnedCompaniesCount)
  const localPlan = useSubscriptionStore((s) => s.plan)

  const { data: apiCompanies } = useSupplierCompaniesQuery(hydrated && useApi)
  const { data: apiSub } = useSupplierSubscriptionQuery(hydrated && useApi)
  const createMutation = useCreateSupplierCompanyMutation()

  const plan = useMemo(() => {
    if (useApi) {
      return (apiSub?.is_active ? apiSub.plan : "none") as typeof localPlan
    }
    return localPlan
  }, [useApi, apiSub, localPlan])

  const limitBlocked = useMemo(() => {
    if (!user) return false
    if (useApi) {
      const ownedCount = (apiCompanies?.items ?? []).filter(
        (c) => c.owner_id === user.userId,
      ).length
      const limit = getCompanyLimit(plan)
      if (limit === null) return false
      return ownedCount >= limit
    }
    return !canUserCreateCompany(user.userId, plan)
  }, [
    user,
    useApi,
    apiCompanies,
    plan,
    canUserCreateCompany,
  ])

  const ownedCount = useApi
    ? (apiCompanies?.items ?? []).filter((c) => c.owner_id === user?.userId)
        .length
    : user
      ? getOwnedCompaniesCount(user.userId)
      : 0
  const limit = getCompanyLimit(plan)

  const handleSubmit = async (data: CompanyWizardInput) => {
    try {
      if (useApi) {
        await createMutation.mutateAsync(data)
        await restoreSession()
      } else if (user) {
        createLocal(data, {
          userId: user.userId,
          actorType: "supplier",
        })
        toast.success("Компания создана")
      }
      router.push("/supplier/company")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Не удалось создать компанию"))
    }
  }

  return (
    <CompanyWizard
      actorType="supplier"
      basePath="/supplier/company"
      mode="create"
      limitBlocked={limitBlocked}
      limitMessage={
        limit === null
          ? "Лимит компаний исчерпан"
          : `На тарифе доступно до ${limit} компаний (сейчас ${ownedCount}). Оформите подписку, чтобы добавить ещё.`
      }
      subscriptionHref="/supplier/subscription"
      onSubmit={(data) => void handleSubmit(data)}
    />
  )
}
