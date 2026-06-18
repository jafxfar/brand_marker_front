"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { CompanyWizard } from "@/components/company/company-wizard"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import {
  useBuyerCompaniesQuery,
  useUpdateBuyerCompanyMutation,
} from "@/hooks/api/use-buyer-companies-query"
import { companyToWizardInput, filterCompaniesByActorType } from "@/lib/company-wizard-utils"
import type { CompanyWizardInput } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function CustomerCompanyEditPage({ params }: PageProps) {
  const { id } = use(params)
  const companyId = Number(id)
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const updateCompanyFromWizard = useCompaniesStore((s) => s.updateCompanyFromWizard)
  const useApi = isApiEnabled()
  const { data: apiCompanies, isLoading } = useBuyerCompaniesQuery(hydrated && useApi)
  const updateMutation = useUpdateBuyerCompanyMutation()

  if (!hydrated || !user) return null

  const actorType = "buyer" as const
  const localCompany = getCompany(companyId)
  const apiCompany = apiCompanies?.find((c) => c.id === companyId)
  const company = useApi ? apiCompany : localCompany

  if (useApi && isLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/3 mb-4" />
        <div className="h-64 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!company || !filterCompaniesByActorType([company], actorType).length) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-muted-foreground">Компания не найдена</p>
      </div>
    )
  }

  const handleSubmit = async (data: CompanyWizardInput) => {
    if (useApi) {
      await updateMutation.mutateAsync({ companyId, data })
      router.push("/customer/company")
      return
    }
    updateCompanyFromWizard(companyId, data)
    router.push("/customer/company")
  }

  return (
    <CompanyWizard
      actorType="buyer"
      basePath="/customer/company"
      mode="edit"
      initial={companyToWizardInput(company)}
      onSubmit={handleSubmit}
    />
  )
}
