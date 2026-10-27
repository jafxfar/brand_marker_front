import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reviewsApi, supplierReviewsApi, type ReviewCreatePayload } from "@/lib/api/companies"
import { isApiEnabled } from "@/lib/api/config"
import { contractKeys } from "./use-contracts-query"

import type { PageParams } from "@/lib/pagination"

export const reviewKeys = {
  all: ["buyer-reviews"] as const,
  given: (page = 1) => [...reviewKeys.all, "given", page] as const,
  received: (page = 1) => [...reviewKeys.all, "received", page] as const,
}

export const supplierReviewKeys = {
  all: ["supplier-reviews"] as const,
  given: (page = 1) => [...supplierReviewKeys.all, "given", page] as const,
  received: (page = 1) => [...supplierReviewKeys.all, "received", page] as const,
}

export const useBuyerReviewsQuery = (enabled = true, params: PageParams = {}) =>
  useQuery({
    queryKey: reviewKeys.given(params.page ?? 1),
    queryFn: () => reviewsApi.listGiven(params),
    enabled: enabled && isApiEnabled(),
  })

export const useBuyerReceivedReviewsQuery = (
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: reviewKeys.received(params.page ?? 1),
    queryFn: () => reviewsApi.listReceived(params),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierReviewsQuery = (
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: supplierReviewKeys.given(params.page ?? 1),
    queryFn: () => supplierReviewsApi.listGiven(params),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierReceivedReviewsQuery = (
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: supplierReviewKeys.received(params.page ?? 1),
    queryFn: () => supplierReviewsApi.listReceived(params),
    enabled: enabled && isApiEnabled(),
  })

export const useCreateReviewMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewCreatePayload) => reviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
    },
    meta: {
      successMessage: "Отзыв отправлен",
      errorMessage: "Не удалось отправить отзыв",
    },
  })
}

export const useCreateSupplierReviewMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewCreatePayload) => supplierReviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierReviewKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
    },
    meta: {
      successMessage: "Отзыв отправлен",
      errorMessage: "Не удалось отправить отзыв",
    },
  })
}
