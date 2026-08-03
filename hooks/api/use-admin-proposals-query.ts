import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminProposalAction,
  type AdminProposalParams,
} from "@/lib/api/admin"

export const adminProposalKeys = {
  all: ["admin-proposals"] as const,
  lists: () => [...adminProposalKeys.all, "list"] as const,
  list: (params: AdminProposalParams) =>
    [...adminProposalKeys.lists(), params] as const,
  details: () => [...adminProposalKeys.all, "detail"] as const,
  detail: (proposalId: number) =>
    [...adminProposalKeys.details(), proposalId] as const,
}

export const useAdminProposalsQuery = (params: AdminProposalParams) =>
  useQuery({
    queryKey: adminProposalKeys.list(params),
    queryFn: () => adminApi.getProposals(params),
    placeholderData: keepPreviousData,
  })

export const useAdminProposalQuery = (proposalId: number) =>
  useQuery({
    queryKey: adminProposalKeys.detail(proposalId),
    queryFn: () => adminApi.getProposal(proposalId),
    enabled: Number.isInteger(proposalId) && proposalId > 0,
  })

export const useAdminProposalActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      proposalId,
      action,
      reason,
    }: {
      proposalId: number
      action: AdminProposalAction
      reason?: string
    }) => adminApi.applyProposalAction(proposalId, action, reason),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminProposalKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminProposalKeys.detail(variables.proposalId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
  })
}
