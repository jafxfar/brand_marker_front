import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { contractsApi } from "@/lib/api/contracts"
import { supplierContractsApi } from "@/lib/api/supplier/contracts"
import { isApiEnabled } from "@/lib/api/config"

export const contractKeys = {
  all: ["contracts"] as const,
  list: () => [...contractKeys.all, "list"] as const,
  detail: (id: number) => [...contractKeys.all, "detail", id] as const,
}

export const supplierContractKeys = {
  all: ["supplier-contracts"] as const,
  list: () => [...supplierContractKeys.all, "list"] as const,
  detail: (id: number) => [...supplierContractKeys.all, "detail", id] as const,
}

export const useContractsQuery = (enabled = true) =>
  useQuery({
    queryKey: contractKeys.list(),
    queryFn: () => contractsApi.list(),
    enabled: enabled && isApiEnabled(),
  })

export const useSupplierContractsQuery = (enabled = true) =>
  useQuery({
    queryKey: supplierContractKeys.list(),
    queryFn: () => supplierContractsApi.list(),
    enabled: enabled && isApiEnabled(),
  })

export const useContractQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: () => contractsApi.get(id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const useSupplierContractQuery = (id: number, enabled = true) =>
  useQuery({
    queryKey: supplierContractKeys.detail(id),
    queryFn: () => supplierContractsApi.get(id),
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

export const useSupplierSendMessageMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, text }: { contractId: number; text: string }) =>
      supplierContractsApi.sendMessage(contractId, text),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: supplierContractKeys.detail(contractId) })
      qc.invalidateQueries({ queryKey: supplierContractKeys.list() })
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
      qc.invalidateQueries({ queryKey: contractKeys.list() })
    },
  })
}

export const useRejectSubmissionMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      contractId,
      submissionId,
    }: {
      contractId: number
      submissionId: number
    }) => contractsApi.rejectSubmission(contractId, submissionId),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) })
      qc.invalidateQueries({ queryKey: contractKeys.list() })
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

export const useSupplierOpenDisputeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, reason }: { contractId: number; reason: string }) =>
      supplierContractsApi.openDispute(contractId, reason),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: supplierContractKeys.detail(contractId) })
      qc.invalidateQueries({ queryKey: supplierContractKeys.list() })
    },
  })
}

export const useSupplierSubmitWorkMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      contractId,
      note,
      fileNames,
      assets,
    }: {
      contractId: number
      note: string
      fileNames: string[]
      assets: {
        kind: string
        name: string
        url: string
        file_type?: string | null
      }[]
    }) =>
      supplierContractsApi.submitWork(contractId, {
        note,
        file_names: fileNames,
        assets,
      }),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: supplierContractKeys.detail(contractId) })
      qc.invalidateQueries({ queryKey: supplierContractKeys.list() })
    },
  })
}

export const useSupplierUploadContractFileMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contractId, file }: { contractId: number; file: File }) =>
      supplierContractsApi.uploadFile(contractId, file),
    onSuccess: (_d, { contractId }) => {
      qc.invalidateQueries({ queryKey: supplierContractKeys.detail(contractId) })
    },
  })
}
