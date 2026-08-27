import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminRfqAction,
  type AdminRfqParams,
} from "@/lib/api/admin"

export const adminRfqKeys = {
  all: ["admin-rfqs"] as const,
  lists: () => [...adminRfqKeys.all, "list"] as const,
  list: (params: AdminRfqParams) => [...adminRfqKeys.lists(), params] as const,
  details: () => [...adminRfqKeys.all, "detail"] as const,
  detail: (rfqId: string) => [...adminRfqKeys.details(), rfqId] as const,
}

export const useAdminRfqsQuery = (params: AdminRfqParams) =>
  useQuery({
    queryKey: adminRfqKeys.list(params),
    queryFn: () => adminApi.getRfqs(params),
    placeholderData: keepPreviousData,
  })

export const useAdminRfqQuery = (rfqId: string) =>
  useQuery({
    queryKey: adminRfqKeys.detail(rfqId),
    queryFn: () => adminApi.getRfq(rfqId),
    enabled: Boolean(rfqId),
  })

export const useAdminRfqActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      rfqId,
      action,
      reason,
    }: {
      rfqId: string
      action: AdminRfqAction
      reason?: string
    }) => adminApi.applyRfqAction(rfqId, action, reason),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminRfqKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminRfqKeys.detail(variables.rfqId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
    meta: {
      errorMessage: "Не удалось изменить заявку",
    },
  })
}
