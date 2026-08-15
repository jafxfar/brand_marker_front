import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentsApi } from "@/lib/api/payments"
import { isApiEnabled } from "@/lib/api/config"
import { contractKeys } from "./use-contracts-query"

export const paymentKeys = {
  all: ["payments"] as const,
  history: () => [...paymentKeys.all, "history"] as const,
  pending: () => [...paymentKeys.all, "pending"] as const,
  milestones: (contractId: number) =>
    [...paymentKeys.all, "milestones", contractId] as const,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
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
  })
}

/** Fund escrow for a milestone. Mock confirm is already applied inside fund. */
export const useFundAndConfirmMilestoneMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: number) => paymentsApi.fundMilestone(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}
