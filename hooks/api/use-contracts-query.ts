import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { contractsApi } from "@/lib/api/contracts"
import { isApiEnabled } from "@/lib/api/config"

export const contractKeys = {
  all: ["contracts"] as const,
  list: () => [...contractKeys.all, "list"] as const,
  detail: (id: number) => [...contractKeys.all, "detail", id] as const,
}

export const useContractsQuery = (enabled = true) =>
  useQuery({
    queryKey: contractKeys.list(),
    queryFn: () => contractsApi.list(),
    enabled: enabled && isApiEnabled(),
  })

export const useContractQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractsApi.get(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const useSendMessageMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, text }: { contractId: number; text: string }) =>
      contractsApi.sendMessage(contractId, text),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) })
      qc.invalidateQueries({ queryKey: contractKeys.list() })
    },
  })
}

export const useApproveSubmissionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      contractId,
      submissionId,
    }: {
      contractId: number
      submissionId: number
    }) => contractsApi.approveSubmission(contractId, submissionId),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) })
    },
  })
}

export const useOpenDisputeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, reason }: { contractId: number; reason: string }) =>
      contractsApi.openDispute(contractId, reason),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) })
      qc.invalidateQueries({ queryKey: contractKeys.list() })
    },
  })
}
