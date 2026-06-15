"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { CompanyWizard } from "@/components/company/company-wizard"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { companyToWizardInput, filterCompaniesByActorType } from "@/lib/company-wizard-utils"
import type { CompanyWizardInput } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function SupplierCompanyEditPage({ params }: PageProps) {
  const { id } = use(params)
  const companyId = Number(id)
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const updateCompanyFromWizard = useCompaniesStore((s) => s.updateCompanyFromWizard)

  if (!hydrated || !user) return null

  const company = getCompany(companyId)
  const actorType = "supplier" as const

  if (!company || !filterCompaniesByActorType([company], actorType).length) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-muted-foreground">Компания не найдена</p>
      </div>
    )
  }

  const handleSubmit = (data: CompanyWizardInput) => {
    updateCompanyFromWizard(companyId, data)
    router.push("/supplier/company")
  }

  return (
    <CompanyWizard
      actorType="supplier"
      basePath="/supplier/company"
      mode="edit"
      initial={companyToWizardInput(company)}
      onSubmit={handleSubmit}
    />
  )
}
