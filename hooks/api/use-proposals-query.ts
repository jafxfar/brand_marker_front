import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { proposalsApi } from "@/lib/api/proposals"
import { isApiEnabled } from "@/lib/api/config"
import { rfqKeys } from "./use-rfqs-query"
import { contractKeys, supplierContractKeys } from "./use-contracts-query"
import { notificationKeys } from "./use-notifications-query"

export const proposalKeys = {
  forRfq: (rfqId: string) => ["proposals", rfqId] as const,
}

export const useProposalsForRfqQuery = (rfqId: string, enabled = true) =>
  useQuery({
    queryKey: proposalKeys.forRfq(rfqId),
    queryFn: () => proposalsApi.listForRfq(rfqId),
    enabled: enabled && isApiEnabled() && Boolean(rfqId),
  })

export const useShortlistProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => proposalsApi.shortlist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] })
      qc.invalidateQueries({ queryKey: rfqKeys.all })
    },
  })
}

export const useRejectProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => proposalsApi.reject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] })
      qc.invalidateQueries({ queryKey: rfqKeys.all })
    },
  })
}

export const useAcceptProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => proposalsApi.accept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] })
      qc.invalidateQueries({ queryKey: rfqKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
      qc.invalidateQueries({ queryKey: supplierContractKeys.all })
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
