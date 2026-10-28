import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  supplierSubscriptionApi,
  type SubscriptionPaymentMethodId,
} from "@/lib/api/supplier/subscription"
import { isApiEnabled } from "@/lib/api/config"

export const supplierSubscriptionKeys = {
  all: ["supplier-subscription"] as const,
  config: ["supplier-subscription", "payment-config"] as const,
}

export const useSupplierSubscriptionQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierSubscriptionKeys.all,
    queryFn: () => supplierSubscriptionApi.get(),
    enabled: enabled && isApiEnabled(),
  })

export const useSubscriptionPaymentConfigQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierSubscriptionKeys.config,
    queryFn: () => supplierSubscriptionApi.paymentConfig(),
    enabled: enabled && isApiEnabled(),
  })

export const useActivateSubscriptionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      plan,
      method = "alif",
    }: {
      plan: string
      method?: SubscriptionPaymentMethodId
    }) => supplierSubscriptionApi.checkout(plan, method),
    onSuccess: (data) => {
      if (data.is_active || data.payment_status === "paid") {
        qc.invalidateQueries({ queryKey: supplierSubscriptionKeys.all })
      }
    },
    meta: {
      errorMessage: "Не удалось оформить подписку",
    },
  })
}

export const useSyncSubscriptionOrderMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => supplierSubscriptionApi.syncAlifOrder(orderId),
    onSuccess: (data) => {
      if (data.is_active || data.payment_status === "ok") {
        qc.invalidateQueries({ queryKey: supplierSubscriptionKeys.all })
      }
    },
  })
}

export const useCancelSubscriptionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => supplierSubscriptionApi.cancel(),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierSubscriptionKeys.all }),
    meta: {
      successMessage: "Подписка отменена",
      errorMessage: "Не удалось отменить подписку",
    },
  })
}
