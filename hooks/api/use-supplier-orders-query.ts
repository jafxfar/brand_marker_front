import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierOrdersApi } from "@/lib/api/supplier/orders"
import { isApiEnabled } from "@/lib/api/config"

export const supplierOrderKeys = {
  all: ["supplier-orders"] as const,
  list: (tab: string) => [...supplierOrderKeys.all, tab] as const,
  customers: () => [...supplierOrderKeys.all, "customers"] as const,
}

export const useSupplierOrdersQuery = (
  tab: "available" | "responded" | "deals",
  enabled = true,
) =>
  useQuery({
    queryKey: supplierOrderKeys.list(tab),
    queryFn: () => supplierOrdersApi.list(tab),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierCustomersQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierOrderKeys.customers(),
    queryFn: () => supplierOrdersApi.customers(),
    enabled: enabled && isApiEnabled(),
  })

export const useSubmitOrderOfferMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string
      data: { price: number; message?: string; delivery_days?: number }
    }) => supplierOrdersApi.submitOffer(orderId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: supplierOrderKeys.all }),
  })
}
