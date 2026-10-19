import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierFinanceApi } from "@/lib/api/supplier/finance"
import { isApiEnabled } from "@/lib/api/config"
import type { PageParams } from "@/lib/pagination"
import { supplierPaymentKeys } from "./use-supplier-payments-query"

export const supplierFinanceKeys = {
  all: ["supplier-finance"] as const,
  destinations: (page = 1) =>
    [...supplierFinanceKeys.all, "destinations", page] as const,
  withdrawals: (page = 1) =>
    [...supplierFinanceKeys.all, "withdrawals", page] as const,
  invoices: (page = 1) => [...supplierFinanceKeys.all, "invoices", page] as const,
}

export const useSupplierFinanceDestinationsQuery = (
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: supplierFinanceKeys.destinations(params.page ?? 1),
    queryFn: () => supplierFinanceApi.destinations(params),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierWithdrawalsQuery = (
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: supplierFinanceKeys.withdrawals(params.page ?? 1),
    queryFn: () => supplierFinanceApi.withdrawals(params),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierInvoicesQuery = (enabled = true, params: PageParams = {}) =>
  useQuery({
    queryKey: supplierFinanceKeys.invoices(params.page ?? 1),
    queryFn: () => supplierFinanceApi.invoices(params),
    enabled: enabled && isApiEnabled(),
  })

export const useCreateDestinationMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { type: string; label: string; details: string; is_default?: boolean }) =>
      supplierFinanceApi.createDestination(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierFinanceKeys.destinations() })
    },
    meta: {
      successMessage: "Счёт для выплат добавлен",
      errorMessage: "Не удалось добавить счёт",
    },
  })
}

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
