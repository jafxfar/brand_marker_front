import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProposalAcceptInput } from "@/types"
import { proposalsApi } from "@/lib/api/proposals"
import { supplierProposalsApi } from "@/lib/api/supplier/proposals"
import { isApiEnabled } from "@/lib/api/config"
import { rfqKeys } from "./use-rfqs-query"
import { contractKeys, supplierContractKeys } from "./use-contracts-query"
import { notificationKeys } from "./use-notifications-query"

export const proposalKeys = {
  forRfq: (rfqId: string) => ["proposals", rfqId] as const,
  messages: (id: number) => ["proposal-messages", id] as const,
}

export const useProposalsForRfqQuery = (rfqId: string, enabled = true) =>
  useQuery({
    queryKey: proposalKeys.forRfq(rfqId),
    queryFn: () => proposalsApi.listForRfq(rfqId),
    enabled: enabled && isApiEnabled() && Boolean(rfqId),
  })

export type ProposalChatSide = "buyer" | "supplier"

export const useProposalMessagesQuery = (
  proposalId: number,
  side: ProposalChatSide,
  enabled = true,
) =>
  useQuery({
    queryKey: proposalKeys.messages(proposalId),
    queryFn: () =>
      side === "buyer"
        ? proposalsApi.listMessages(proposalId)
        : supplierProposalsApi.listMessages(proposalId),
    enabled: enabled && isApiEnabled() && proposalId > 0,
  })

export const useSendProposalMessageMutation = (side: ProposalChatSide) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      side === "buyer"
        ? proposalsApi.sendMessage(id, text)
        : supplierProposalsApi.sendMessage(id, text),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: proposalKeys.messages(id) })
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
    meta: {
      errorMessage: "Не удалось отправить сообщение",
    },
  })
}

export const useShortlistProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => proposalsApi.shortlist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] })
      qc.invalidateQueries({ queryKey: rfqKeys.all })
    },
    meta: {
      successMessage: "Предложение в шортлисте",
      errorMessage: "Не удалось добавить в шортлист",
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
    meta: {
      successMessage: "Предложение отклонено",
      errorMessage: "Не удалось отклонить предложение",
    },
  })
}

export const useAcceptProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, terms }: { id: number; terms: ProposalAcceptInput }) =>
      proposalsApi.accept(id, terms),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] })
      qc.invalidateQueries({ queryKey: rfqKeys.all })
      qc.invalidateQueries({ queryKey: contractKeys.all })
      qc.invalidateQueries({ queryKey: supplierContractKeys.all })
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
    meta: {
      successMessage: "Предложение принято",
      errorMessage: "Не удалось принять предложение",
    },
  })
}
