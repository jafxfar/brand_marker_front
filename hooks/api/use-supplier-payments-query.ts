import { useQuery } from "@tanstack/react-query"
import { supplierPaymentsApi } from "@/lib/api/supplier/payments"
import { isApiEnabled } from "@/lib/api/config"

export const supplierPaymentKeys = {
  all: ["supplier-payments"] as const,
  history: () => [...supplierPaymentKeys.all, "history"] as const,
  pending: () => [...supplierPaymentKeys.all, "pending"] as const,
  balance: () => [...supplierPaymentKeys.all, "balance"] as const,
  milestones: (contractId: number) =>
    [...supplierPaymentKeys.all, "milestones", contractId] as const,
}

export const useSupplierPaymentHistoryQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierPaymentKeys.history(),
    queryFn: () => supplierPaymentsApi.history(),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierPendingPayoutsQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierPaymentKeys.pending(),
    queryFn: () => supplierPaymentsApi.pending(),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierBalanceQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierPaymentKeys.balance(),
    queryFn: () => supplierPaymentsApi.balance(),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierContractMilestonesQuery = (
  contractId: number,
  enabled = true,
) =>
  useQuery({
    queryKey: supplierPaymentKeys.milestones(contractId),
    queryFn: () => supplierPaymentsApi.getMilestones(contractId),
    enabled: enabled && isApiEnabled() && contractId > 0,
  })
