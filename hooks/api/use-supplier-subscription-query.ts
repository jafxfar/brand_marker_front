import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierSubscriptionApi } from "@/lib/api/supplier/subscription"
import { isApiEnabled } from "@/lib/api/config"

export const supplierSubscriptionKeys = {
  all: ["supplier-subscription"] as const,
}

export const useSupplierSubscriptionQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierSubscriptionKeys.all,
    queryFn: () => supplierSubscriptionApi.get(),
    enabled: enabled && isApiEnabled(),
  })

export const useActivateSubscriptionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (plan: string) => supplierSubscriptionApi.activate(plan),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierSubscriptionKeys.all }),
  })
}

export const useCancelSubscriptionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => supplierSubscriptionApi.cancel(),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierSubscriptionKeys.all }),
  })
}
