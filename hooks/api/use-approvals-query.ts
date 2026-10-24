import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  approvalsApi,
  type CartCheckoutItem,
} from "@/lib/api/approvals"
import { isApiEnabled } from "@/lib/api/config"
import { navCountsKeys } from "@/hooks/api/use-nav-counts-query"
import type { PageParams } from "@/lib/pagination"

export const approvalKeys = {
  all: ["buyer-approvals"] as const,
  list: (status: string, page = 1) =>
    [...approvalKeys.all, "list", status, page] as const,
}

export const useApprovalsQuery = (
  status: "wait" | "hist" | "all" = "all",
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: approvalKeys.list(status, params.page ?? 1),
    queryFn: () => approvalsApi.list({ ...params, status, pageSize: 100 }),
    enabled: enabled && isApiEnabled(),
  })

export const useCartCheckoutMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      items: CartCheckoutItem[]
      idempotency_key?: string
    }) => approvalsApi.checkout(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: approvalKeys.all })
      void qc.invalidateQueries({ queryKey: navCountsKeys.role("buyer") })
    },
  })
}

export const useDecideApprovalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number
      action: "approved" | "rejected"
    }) => approvalsApi.decide(id, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: approvalKeys.all })
      void qc.invalidateQueries({ queryKey: navCountsKeys.role("buyer") })
    },
    meta: {
      successMessage: "Решение сохранено",
      errorMessage: "Не удалось сохранить решение",
    },
  })
}
