import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierFinanceApi } from "@/lib/api/supplier/finance"
import { isApiEnabled } from "@/lib/api/config"
import { supplierPaymentKeys } from "./use-supplier-payments-query"

export const supplierFinanceKeys = {
  all: ["supplier-finance"] as const,
  destinations: () => [...supplierFinanceKeys.all, "destinations"] as const,
  withdrawals: () => [...supplierFinanceKeys.all, "withdrawals"] as const,
  invoices: () => [...supplierFinanceKeys.all, "invoices"] as const,
}

export const useSupplierFinanceDestinationsQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierFinanceKeys.destinations(),
    queryFn: () => supplierFinanceApi.destinations(),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierWithdrawalsQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierFinanceKeys.withdrawals(),
    queryFn: () => supplierFinanceApi.withdrawals(),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierInvoicesQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierFinanceKeys.invoices(),
    queryFn: () => supplierFinanceApi.invoices(),
    enabled: enabled && isApiEnabled(),
  })

export const useRequestWithdrawalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { destination_id: number; amount: number }) =>
      supplierFinanceApi.requestWithdrawal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierFinanceKeys.all })
      qc.invalidateQueries({ queryKey: supplierPaymentKeys.balance() })
    },
    meta: {
      successMessage: "Заявка на вывод отправлена",
      errorMessage: "Не удалось отправить заявку на вывод",
    },
  })
}
