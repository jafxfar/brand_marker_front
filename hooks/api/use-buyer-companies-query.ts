import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { buyerCompaniesApi } from "@/lib/api/companies"
import { isApiEnabled } from "@/lib/api/config"
import type { CompanyWizardInput } from "@/types"

export const buyerCompanyKeys = {
  all: ["buyer-companies"] as const,
  mine: () => [...buyerCompanyKeys.all, "mine"] as const,
}

export const useBuyerCompaniesQuery = (enabled = true) =>
  useQuery({
    queryKey: buyerCompanyKeys.mine(),
    queryFn: () => buyerCompaniesApi.mine(),
    enabled: enabled && isApiEnabled(),
  })

export const useCreateBuyerCompanyMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyWizardInput) => buyerCompaniesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerCompanyKeys.all })
    },
  })
}

export const useUpdateBuyerCompanyMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: number
      data: CompanyWizardInput
    }) => buyerCompaniesApi.update(companyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buyerCompanyKeys.all })
    },
  })
}
