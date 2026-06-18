import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { reviewsApi } from "@/lib/api/companies"
import { isApiEnabled } from "@/lib/api/config"
import { contractKeys } from "./use-contracts-query"

export const reviewKeys = {
  all: ["buyer-reviews"] as const,
  given: () => [...reviewKeys.all, "given"] as const,
}

export const useBuyerReviewsQuery = (enabled = true) =>
  useQuery({
    queryKey: reviewKeys.given(),
    queryFn: () => reviewsApi.listGiven(),
    enabled: enabled && isApiEnabled(),
  })

export const useCreateReviewMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      contract_id: number
      target_actor_id: number
      rating: number
      comment?: string | null
    }) => reviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}
