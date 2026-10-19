import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supplierRfqsApi, supplierProposalsApi } from "@/lib/api/supplier/proposals"
import { isApiEnabled } from "@/lib/api/config"
import { notificationKeys } from "@/hooks/api/use-notifications-query"
import type { PageParams } from "@/lib/pagination"
import type { ProposalWithRelations } from "@/types"

export const supplierRfqKeys = {
  all: ["supplier-rfqs"] as const,
  board: (page = 1) => [...supplierRfqKeys.all, "board", page] as const,
  detail: (id: string) => [...supplierRfqKeys.all, "detail", id] as const,
  proposals: (page = 1) => ["supplier-proposals", page] as const,
}

export const useSupplierRfqBoardQuery = (enabled = true, params: PageParams = {}) =>
  useQuery({
    queryKey: supplierRfqKeys.board(params.page ?? 1),
    queryFn: () => supplierRfqsApi.board(params),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierRfqQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: supplierRfqKeys.detail(id),
    queryFn: () => supplierRfqsApi.get(id),
    enabled: enabled && isApiEnabled() && Boolean(id),
  })

export const useSupplierProposalsQuery = (enabled = true, params: PageParams = {}) =>
  useQuery({
    queryKey: supplierRfqKeys.proposals(params.page ?? 1),
    queryFn: () => supplierProposalsApi.list(params),
    enabled: enabled && isApiEnabled(),
  })

export const useSubmitSupplierProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      rfqId,
      data,
    }: {
      rfqId: string
      data: {
        price: number
        currency: string
        delivery_time?: string
        message?: string
      }
    }) => supplierRfqsApi.submitProposal(rfqId, data),
    onSuccess: (_data, { rfqId }) => {
      qc.invalidateQueries({ queryKey: supplierRfqKeys.all })
      qc.invalidateQueries({ queryKey: supplierRfqKeys.detail(rfqId) })
      qc.invalidateQueries({ queryKey: supplierRfqKeys.proposals() })
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
    meta: {
      successMessage: "Предложение отправлено",
      errorMessage: "Не удалось отправить предложение",
    },
  })
}

export const useWithdrawProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => supplierProposalsApi.withdraw(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierRfqKeys.all })
      qc.invalidateQueries({ queryKey: supplierRfqKeys.proposals() })
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
    meta: {
      successMessage: "Предложение отозвано",
      errorMessage: "Не удалось отозвать предложение",
    },
  })
}

export const useUpdateSupplierProposalMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: {
        price?: number
        currency?: string
        delivery_time?: string
        message?: string
      }
    }) => supplierProposalsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplierRfqKeys.all })
      qc.invalidateQueries({ queryKey: supplierRfqKeys.proposals() })
    },
    meta: {
      successMessage: "Предложение обновлено",
      errorMessage: "Не удалось обновить предложение",
    },
  })
}

export const hasSupplierProposalForRfq = (
  proposals: ProposalWithRelations[] | undefined,
  rfqId: string,
): boolean => Boolean(proposals?.some((p) => p.rfq_id === rfqId))
