"use client"

import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"
import { isApiEnabled } from "@/lib/api/config"
import { publicApi } from "@/lib/api/public"
import type { Review, ReviewParty } from "@/types"

const toParty = (
  actorId: number,
  data: {
    kind: string
    display_name: string
    company_id?: number | null
  } | null,
): ReviewParty | null => {
  if (!data) return null
  const isCompany = data.kind === "company"
  return {
    actor_id: actorId,
    kind: data.kind,
    display_name: data.display_name,
    company_title: isCompany ? data.display_name : null,
    user_name: isCompany ? null : data.display_name,
  }
}

/**
 * Fills missing review.reviewer / review.target from public buyer/supplier APIs
 * so the UI can show a person/company name instead of «Заказчик #N».
 */
export const useEnrichReviewParties = (
  reviews: Review[],
  enabled = true,
): Review[] => {
  const useApi = isApiEnabled()
  const missingReviewerIds = useMemo(() => {
    const ids = new Set<number>()
    for (const review of reviews) {
      if (!review.reviewer?.display_name && !review.reviewer?.user_name && !review.reviewer?.company_title) {
        ids.add(review.reviewer_actor_id)
      }
    }
    return [...ids]
  }, [reviews])

  const missingTargetIds = useMemo(() => {
    const ids = new Set<number>()
    for (const review of reviews) {
      if (!review.target?.display_name && !review.target?.user_name && !review.target?.company_title) {
        ids.add(review.target_actor_id)
      }
    }
    return [...ids]
  }, [reviews])

  const reviewerQueries = useQueries({
    queries: missingReviewerIds.map((actorId) => ({
      queryKey: ["public-buyer-brief", actorId],
      queryFn: () => publicApi.buyer(actorId),
      enabled: enabled && useApi && actorId > 0,
      staleTime: 60_000,
      retry: false,
    })),
  })

  const targetQueries = useQueries({
    queries: missingTargetIds.map((actorId) => ({
      queryKey: ["public-supplier-brief", actorId],
      queryFn: () => publicApi.supplier(actorId),
      enabled: enabled && useApi && actorId > 0,
      staleTime: 60_000,
      retry: false,
    })),
  })

  return useMemo(() => {
    const reviewerMap = new Map<number, ReviewParty>()
    missingReviewerIds.forEach((actorId, index) => {
      const party = toParty(actorId, reviewerQueries[index]?.data ?? null)
      if (party) reviewerMap.set(actorId, party)
    })
    const targetMap = new Map<number, ReviewParty>()
    missingTargetIds.forEach((actorId, index) => {
      const party = toParty(actorId, targetQueries[index]?.data ?? null)
      if (party) targetMap.set(actorId, party)
    })

    if (reviewerMap.size === 0 && targetMap.size === 0) return reviews

    return reviews.map((review) => {
      const reviewer =
        review.reviewer?.user_name ||
        review.reviewer?.company_title ||
        review.reviewer?.display_name
          ? review.reviewer
          : reviewerMap.get(review.reviewer_actor_id) ?? review.reviewer
      const target =
        review.target?.user_name ||
        review.target?.company_title ||
        review.target?.display_name
          ? review.target
          : targetMap.get(review.target_actor_id) ?? review.target
      if (reviewer === review.reviewer && target === review.target) return review
      return { ...review, reviewer, target }
    })
  }, [
    reviews,
    missingReviewerIds,
    missingTargetIds,
    reviewerQueries,
    targetQueries,
  ])
}
