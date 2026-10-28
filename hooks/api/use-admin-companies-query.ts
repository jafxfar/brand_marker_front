import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminCompaniesParams,
  type AdminCompanyAction,
  type AdminCompanyChangeRequestsParams,
  type AdminPendingVerificationParams,
} from "@/lib/api/admin"

export const adminCompaniesKeys = {
  all: ["admin-companies"] as const,
  lists: () => [...adminCompaniesKeys.all, "list"] as const,
  list: (params: AdminCompaniesParams) =>
    [...adminCompaniesKeys.lists(), params] as const,
  pendingVerification: (params: AdminPendingVerificationParams) =>
    [...adminCompaniesKeys.all, "pending-verification", params] as const,
  changeRequests: (params: AdminCompanyChangeRequestsParams) =>
    [...adminCompaniesKeys.all, "change-requests", params] as const,
  changeRequest: (requestId: number) =>
    [...adminCompaniesKeys.all, "change-request", requestId] as const,
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

export const useAdminCompanyChangeRequestsQuery = (
  params: AdminCompanyChangeRequestsParams,
) =>
  useQuery({
    queryKey: adminCompaniesKeys.changeRequests(params),
    queryFn: () => adminApi.getCompanyChangeRequests(params),
    placeholderData: keepPreviousData,
  })

export const useAdminCompanyChangeRequestQuery = (requestId: number) =>
  useQuery({
    queryKey: adminCompaniesKeys.changeRequest(requestId),
    queryFn: () => adminApi.getCompanyChangeRequest(requestId),
    enabled: Number.isInteger(requestId) && requestId > 0,
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
    queryClient.invalidateQueries({
      queryKey: [...adminCompaniesKeys.all, "change-requests"],
    }),
    companyId != null
      ? queryClient.invalidateQueries({
          queryKey: adminCompaniesKeys.detail(companyId),
        })
      : queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.details() }),
    queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
  ])
}

export const useAdminCompanyChangeRequestActionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      requestId,
      action,
      reason,
    }: {
      requestId: number
      action: "approve" | "reject"
      reason?: string
    }) => adminApi.applyCompanyChangeRequestAction(requestId, action, reason),
    onSuccess: async (data) => {
      await invalidateCompanyQueries(queryClient, data.company_id)
      await queryClient.invalidateQueries({
        queryKey: adminCompaniesKeys.changeRequest(data.id),
      })
    },
    meta: {
      errorMessage: "Не удалось обработать заявку",
    },
  })
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

export const useAdminCompanyVipMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      vip,
      months,
      reason,
    }: {
      companyId: number
      vip: boolean
      months?: number | null
      reason?: string | null
    }) => adminApi.setCompanyVip(companyId, { vip, months, reason }),
    onSuccess: async (_, variables) => {
      await invalidateCompanyQueries(queryClient, variables.companyId)
    },
    meta: {
      errorMessage: "Не удалось изменить VIP",
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
