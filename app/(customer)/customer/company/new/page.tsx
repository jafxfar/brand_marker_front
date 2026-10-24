"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CompanyWizard } from "@/components/company/company-wizard"
import { useCreateBuyerCompanyMutation } from "@/hooks/api/use-buyer-companies-query"
import { getApiErrorMessage } from "@/lib/api/client"
import { isApiEnabled } from "@/lib/api/config"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import type { CompanyWizardInput } from "@/types"

export default function CustomerCompanyNewPage() {
  const router = useRouter()
  const useApi = isApiEnabled()
  const user = useAuthStore((s) => s.user)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const createLocal = useCompaniesStore((s) => s.createCompany)
  const createMutation = useCreateBuyerCompanyMutation()

  const handleSubmit = async (data: CompanyWizardInput) => {
    try {
      if (useApi) {
        await createMutation.mutateAsync(data)
        await restoreSession()
      } else if (user) {
        createLocal(data, {
          userId: user.userId,
          actorType: "buyer",
        })
        toast.success("Компания создана")
      }
      router.push("/customer/company")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Не удалось создать компанию"))
    }
  }

  return (
    <CompanyWizard
      actorType="buyer"
      basePath="/customer/company"
      mode="create"
      onSubmit={(data) => void handleSubmit(data)}
    />
  )
}
