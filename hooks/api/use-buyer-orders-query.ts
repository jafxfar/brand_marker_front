import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  buyerOrdersApi,
  type CreateBuyerOrderPayload,
} from "@/lib/api/buyer/orders"
import { isApiEnabled } from "@/lib/api/config"

export const buyerOrderKeys = {
  all: ["buyer-orders"] as const,
  list: () => [...buyerOrderKeys.all, "list"] as const,
  detail: (id: string) => [...buyerOrderKeys.all, "detail", id] as const,
}

export const useBuyerOrdersQuery = (enabled = true) =>
  useQuery({
    queryKey: buyerOrderKeys.list(),
    queryFn: () => buyerOrdersApi.list(),
    enabled: enabled && isApiEnabled(),
  })

export const useBuyerOrderQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: buyerOrderKeys.detail(id),
    queryFn: () => buyerOrdersApi.get(id),
    enabled: enabled && isApiEnabled() && Boolean(id),
  })

export const useCreateBuyerOrderMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBuyerOrderPayload) => buyerOrdersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: buyerOrderKeys.all }),
  })
}

export const useCancelBuyerOrderMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => buyerOrdersApi.cancel(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: buyerOrderKeys.all })
      qc.invalidateQueries({ queryKey: buyerOrderKeys.detail(id) })
    },
  })
}

export const useAcceptBuyerOfferMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, offerId }: { orderId: string; offerId: string }) =>
      buyerOrdersApi.acceptOffer(orderId, offerId),
    onSuccess: (_d, { orderId }) => {
      qc.invalidateQueries({ queryKey: buyerOrderKeys.all })
      qc.invalidateQueries({ queryKey: buyerOrderKeys.detail(orderId) })
    },
  })
}
