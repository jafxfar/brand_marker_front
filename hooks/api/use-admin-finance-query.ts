import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminFinanceAction,
  type AdminFinanceParams,
} from "@/lib/api/admin"

export const adminFinanceKeys = {
  all: ["admin-finance"] as const,
  lists: () => [...adminFinanceKeys.all, "list"] as const,
  list: (params: AdminFinanceParams) => [...adminFinanceKeys.lists(), params] as const,
  details: () => [...adminFinanceKeys.all, "detail"] as const,
  detail: (paymentId: number) => [...adminFinanceKeys.details(), paymentId] as const,
}

export const useAdminFinanceQuery = (params: AdminFinanceParams) =>
  useQuery({
    queryKey: adminFinanceKeys.list(params),
    queryFn: () => adminApi.getFinance(params),
    placeholderData: keepPreviousData,
  })

export const useAdminFinancePaymentQuery = (paymentId: number) =>
  useQuery({
    queryKey: adminFinanceKeys.detail(paymentId),
    queryFn: () => adminApi.getFinancePayment(paymentId),
    enabled: Number.isInteger(paymentId) && paymentId > 0,
  })

export const useAdminFinanceActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      paymentId,
      action,
      reason,
    }: {
      paymentId: number
      action: AdminFinanceAction
      reason?: string
    }) => adminApi.applyFinanceAction(paymentId, action, reason),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminFinanceKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminFinanceKeys.detail(variables.paymentId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
    meta: {
      errorMessage: "Не удалось выполнить действие",
    },
  })
}
