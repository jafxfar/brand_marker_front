import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminCompaniesParams,
  type AdminCompanyAction,
  type AdminPendingVerificationParams,
} from "@/lib/api/admin"

export const adminCompaniesKeys = {
  all: ["admin-companies"] as const,
  lists: () => [...adminCompaniesKeys.all, "list"] as const,
  list: (params: AdminCompaniesParams) =>
    [...adminCompaniesKeys.lists(), params] as const,
  pendingVerification: (params: AdminPendingVerificationParams) =>
    [...adminCompaniesKeys.all, "pending-verification", params] as const,
  details: () => [...adminCompaniesKeys.all, "detail"] as const,
  detail: (companyId: number) =>
    [...adminCompaniesKeys.details(), companyId] as const,
}

export const useAdminCompaniesQuery = (params: AdminCompaniesParams) =>
  useQuery({
    queryKey: adminCompaniesKeys.list(params),
    queryFn: () => adminApi.getCompanies(params),
    placeholderData: keepPreviousData,
  })

export const useAdminPendingVerificationQuery = (
  params: AdminPendingVerificationParams,
) =>
  useQuery({
    queryKey: adminCompaniesKeys.pendingVerification(params),
    queryFn: () => adminApi.getPendingVerificationCompanies(params),
    placeholderData: keepPreviousData,
  })

export const useAdminCompanyQuery = (companyId: number) =>
  useQuery({
    queryKey: adminCompaniesKeys.detail(companyId),
    queryFn: () => adminApi.getCompany(companyId),
    enabled: Number.isInteger(companyId) && companyId > 0,
  })

const invalidateCompanyQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  companyId?: number,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: [...adminCompaniesKeys.all, "pending-verification"],
    }),
    companyId != null
      ? queryClient.invalidateQueries({
          queryKey: adminCompaniesKeys.detail(companyId),
        })
      : queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.details() }),
    queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
  ])
}

export const useAdminCompanyActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      action,
      reason,
    }: {
      companyId: number
      action: AdminCompanyAction
      reason?: string
    }) => adminApi.applyCompanyAction(companyId, action, reason),
    onSuccess: async (_, variables) => {
      await invalidateCompanyQueries(queryClient, variables.companyId)
    },
    meta: {
      errorMessage: "Не удалось изменить статус компании",
    },
  })
}

/** Legacy approve/reject via /verify; UI should prefer useAdminCompanyActionMutation. */
export const useAdminVerifyCompanyMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      approved,
    }: {
      companyId: number
      approved: boolean
    }) => adminApi.verifyCompany(companyId, approved),
    onSuccess: async (_, variables) => {
      await invalidateCompanyQueries(queryClient, variables.companyId)
    },
    meta: {
      successMessage: "Статус проверки обновлён",
      errorMessage: "Не удалось обновить проверку компании",
    },
  })
}
