import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { paymentsApi, type FundMilestoneResponse } from "@/lib/api/payments"
import { isApiEnabled } from "@/lib/api/config"
import { contractKeys } from "./use-contracts-query"

const invalidatePaymentQueries = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: paymentKeys.all })
  qc.invalidateQueries({ queryKey: contractKeys.all })
}

const handleFundSuccess = (qc: QueryClient, data: FundMilestoneResponse, successMessage: string) => {
  if (data.payment_url) {
    toast.info("Переход к оплате…")
    window.location.assign(data.payment_url)
    return
  }
  toast.success(successMessage)
  invalidatePaymentQueries(qc)
}

export const paymentKeys = {
  all: ["payments"] as const,
  config: () => [...paymentKeys.all, "config"] as const,
  history: () => [...paymentKeys.all, "history"] as const,
  pending: () => [...paymentKeys.all, "pending"] as const,
  milestones: (contractId: number) =>
    [...paymentKeys.all, "milestones", contractId] as const,
}

export const usePaymentConfigQuery = (enabled = true) =>
  useQuery({
    queryKey: paymentKeys.config(),
    queryFn: () => paymentsApi.config(),
    enabled: enabled && isApiEnabled(),
    staleTime: 5 * 60_000,
  })

export const useAlifPayment = (enabled = true) => {
  const { data } = usePaymentConfigQuery(enabled)
  const viaAlif = data?.provider === "alif"
  return { viaAlif, currency: viaAlif ? (data?.currency ?? null) : null }
}

export const usePaymentHistoryQuery = (enabled = true) =>
  useQuery({
    queryKey: paymentKeys.history(),
    queryFn: () => paymentsApi.history(),
    enabled: enabled && isApiEnabled(),
  })

export const usePendingPaymentsQuery = (enabled = true) =>
  useQuery({
    queryKey: paymentKeys.pending(),
    queryFn: () => paymentsApi.pending(),
    enabled: enabled && isApiEnabled(),
  })

export const useContractMilestonesQuery = (contractId: number, enabled = true) =>
  useQuery({
    queryKey: paymentKeys.milestones(contractId),
    queryFn: () => paymentsApi.getMilestones(contractId),
    enabled: enabled && isApiEnabled() && contractId > 0,
  })

export const useFundMilestoneMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: number) => paymentsApi.fundMilestone(milestoneId),
    onSuccess: (data) => handleFundSuccess(qc, data, "Оплата отправлена"),
    meta: {
      errorMessage: "Не удалось оплатить этап",
    },
  })
}

export const useApproveMilestoneMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: number) => paymentsApi.approveMilestone(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
    },
    meta: {
      successMessage: "Этап принят",
      errorMessage: "Не удалось принять этап",
    },
  })
}

export const useMockConfirmMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: number) => paymentsApi.mockConfirm(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
    },
    meta: {
      successMessage: "Оплата подтверждена",
      errorMessage: "Не удалось подтвердить оплату",
    },
  })
}

/** Fund escrow for a milestone: redirects to the Alif payment form, or confirms instantly in mock mode. */
export const useFundAndConfirmMilestoneMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: number) => paymentsApi.fundMilestone(milestoneId),
    onSuccess: (data) => handleFundSuccess(qc, data, "Оплата подтверждена"),
    meta: {
      errorMessage: "Не удалось оплатить этап",
    },
  })
}

export const useSyncAlifOrderMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.syncAlifOrder(orderId),
    onSuccess: (data) => {
      if (data.payment_status === "pending") return
      invalidatePaymentQueries(qc)
    },
    meta: {
      silent: true,
    },
  })
}
