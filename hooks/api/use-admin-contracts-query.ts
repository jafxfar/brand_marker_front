import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminContractAction,
  type AdminContractParams,
} from "@/lib/api/admin"

export const adminContractKeys = {
  all: ["admin-contracts"] as const,
  lists: () => [...adminContractKeys.all, "list"] as const,
  list: (params: AdminContractParams) => [...adminContractKeys.lists(), params] as const,
  details: () => [...adminContractKeys.all, "detail"] as const,
  detail: (contractId: number) => [...adminContractKeys.details(), contractId] as const,
}

export const useAdminContractsQuery = (params: AdminContractParams) =>
  useQuery({
    queryKey: adminContractKeys.list(params),
    queryFn: () => adminApi.getContracts(params),
    placeholderData: keepPreviousData,
  })

export const useAdminContractQuery = (contractId: number) =>
  useQuery({
    queryKey: adminContractKeys.detail(contractId),
    queryFn: () => adminApi.getContract(contractId),
    enabled: Number.isInteger(contractId) && contractId > 0,
  })

export const useAdminContractActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      contractId,
      action,
      reason,
    }: {
      contractId: number
      action: AdminContractAction
      reason?: string
    }) => adminApi.applyContractAction(contractId, action, reason),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminContractKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminContractKeys.detail(variables.contractId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
  })
}
