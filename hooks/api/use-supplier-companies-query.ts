import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierCompaniesApi } from "@/lib/api/supplier/companies"
import { isApiEnabled } from "@/lib/api/config"
import type { CompanyWizardInput } from "@/types"

import type { PageParams } from "@/lib/pagination"

export const supplierCompanyKeys = {
  all: ["supplier-companies"] as const,
  mine: (page = 1) => [...supplierCompanyKeys.all, "mine", page] as const,
}

export const useSupplierCompaniesQuery = (
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: supplierCompanyKeys.mine(params.page ?? 1),
    queryFn: () => supplierCompaniesApi.mine(params),
    enabled: enabled && isApiEnabled(),
  })

export const useCreateSupplierCompanyMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyWizardInput) => supplierCompaniesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierCompanyKeys.all })
    },
    meta: {
      successMessage: "Компания создана",
      errorMessage: "Не удалось создать компанию",
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
    meta: {
      successMessage: "Компания обновлена",
      errorMessage: "Не удалось обновить компанию",
    },
  })
}
