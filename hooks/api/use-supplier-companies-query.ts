import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  supplierCompaniesApi,
  type CompanyProfileExtras,
} from "@/lib/api/supplier/companies"
import type {
  TeamMemberPayload,
  TeamMemberUpdatePayload,
} from "@/lib/api/companies"
import { isApiEnabled } from "@/lib/api/config"
import type { CompanyWizardInput } from "@/types"
import type { PageParams } from "@/lib/pagination"

export const supplierCompanyKeys = {
  all: ["supplier-companies"] as const,
  mine: (page = 1) => [...supplierCompanyKeys.all, "mine", page] as const,
  detail: (companyId: number) =>
    [...supplierCompanyKeys.all, "detail", companyId] as const,
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

export const useSupplierCompanyQuery = (
  companyId: number | null | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: supplierCompanyKeys.detail(companyId ?? 0),
    queryFn: () => supplierCompaniesApi.get(companyId!),
    enabled: enabled && isApiEnabled() && Boolean(companyId),
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
      data: CompanyWizardInput & CompanyProfileExtras
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

const invalidateSupplierCompanies = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: supplierCompanyKeys.all })
}

export const useAddSupplierTeamMemberMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: number
      data: TeamMemberPayload
    }) => supplierCompaniesApi.addTeamMember(companyId, data),
    onSuccess: () => invalidateSupplierCompanies(qc),
    meta: {
      successMessage: "Сотрудник добавлен",
      errorMessage: "Не удалось добавить сотрудника",
    },
  })
}

export const useUpdateSupplierTeamMemberMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      targetUserId,
      data,
    }: {
      companyId: number
      targetUserId: number
      data: TeamMemberUpdatePayload
    }) => supplierCompaniesApi.updateTeamMember(companyId, targetUserId, data),
    onSuccess: () => invalidateSupplierCompanies(qc),
    meta: {
      successMessage: "Роль обновлена",
      errorMessage: "Не удалось изменить роль",
    },
  })
}

export const useRemoveSupplierTeamMemberMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      companyId,
      targetUserId,
    }: {
      companyId: number
      targetUserId: number
    }) => supplierCompaniesApi.removeTeamMember(companyId, targetUserId),
    onSuccess: () => invalidateSupplierCompanies(qc),
    meta: {
      successMessage: "Сотрудник удалён",
      errorMessage: "Не удалось удалить сотрудника",
    },
  })
}
