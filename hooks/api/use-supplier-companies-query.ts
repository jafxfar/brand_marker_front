import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierCompaniesApi } from "@/lib/api/supplier/companies"
import { isApiEnabled } from "@/lib/api/config"
import type { CompanyWizardInput } from "@/types"

export const supplierCompanyKeys = {
  all: ["supplier-companies"] as const,
  mine: () => [...supplierCompanyKeys.all, "mine"] as const,
}

export const useSupplierCompaniesQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierCompanyKeys.mine(),
    queryFn: () => supplierCompaniesApi.mine(),
    enabled: enabled && isApiEnabled(),
  })

export const useCreateSupplierCompanyMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyWizardInput) => supplierCompaniesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierCompanyKeys.all })
    },
  })
}

export const useUpdateSupplierCompanyMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: number
      data: CompanyWizardInput
    }) => supplierCompaniesApi.update(companyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierCompanyKeys.all })
    },
  })
}
