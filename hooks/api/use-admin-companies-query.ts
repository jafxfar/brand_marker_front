import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminCompaniesParams,
  type AdminCompanyAction,
} from "@/lib/api/admin"

export const adminCompaniesKeys = {
  all: ["admin-companies"] as const,
  lists: () => [...adminCompaniesKeys.all, "list"] as const,
  list: (params: AdminCompaniesParams) =>
    [...adminCompaniesKeys.lists(), params] as const,
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

export const useAdminCompanyQuery = (companyId: number) =>
  useQuery({
    queryKey: adminCompaniesKeys.detail(companyId),
    queryFn: () => adminApi.getCompany(companyId),
    enabled: Number.isInteger(companyId) && companyId > 0,
  })

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminCompaniesKeys.detail(variables.companyId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
  })
}
