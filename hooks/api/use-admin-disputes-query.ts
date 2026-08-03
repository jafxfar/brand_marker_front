import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminDisputeAction,
  type AdminDisputeParams,
} from "@/lib/api/admin"

export const adminDisputeKeys = {
  all: ["admin-disputes"] as const,
  lists: () => [...adminDisputeKeys.all, "list"] as const,
  list: (params: AdminDisputeParams) => [...adminDisputeKeys.lists(), params] as const,
  details: () => [...adminDisputeKeys.all, "detail"] as const,
  detail: (disputeId: number) => [...adminDisputeKeys.details(), disputeId] as const,
}

export const useAdminDisputesQuery = (params: AdminDisputeParams) =>
  useQuery({
    queryKey: adminDisputeKeys.list(params),
    queryFn: () => adminApi.getDisputes(params),
    placeholderData: keepPreviousData,
  })

export const useAdminDisputeQuery = (disputeId: number) =>
  useQuery({
    queryKey: adminDisputeKeys.detail(disputeId),
    queryFn: () => adminApi.getDispute(disputeId),
    enabled: Number.isInteger(disputeId) && disputeId > 0,
  })

export const useAdminDisputeActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      disputeId,
      action,
      reason,
      partialBuyerAmount,
    }: {
      disputeId: number
      action: AdminDisputeAction
      reason?: string
      partialBuyerAmount?: number
    }) =>
      adminApi.applyDisputeAction(disputeId, action, reason, partialBuyerAmount),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminDisputeKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminDisputeKeys.detail(variables.disputeId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
  })
}
