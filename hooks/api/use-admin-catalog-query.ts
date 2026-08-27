import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminCatalogAction,
  type AdminCatalogParams,
} from "@/lib/api/admin"

export const adminCatalogKeys = {
  all: ["admin-catalog"] as const,
  lists: () => [...adminCatalogKeys.all, "list"] as const,
  list: (params: AdminCatalogParams) =>
    [...adminCatalogKeys.lists(), params] as const,
  details: () => [...adminCatalogKeys.all, "detail"] as const,
  detail: (itemId: number) => [...adminCatalogKeys.details(), itemId] as const,
}

export const useAdminCatalogQuery = (params: AdminCatalogParams) =>
  useQuery({
    queryKey: adminCatalogKeys.list(params),
    queryFn: () => adminApi.getCatalog(params),
    placeholderData: keepPreviousData,
  })

export const useAdminCatalogItemQuery = (itemId: number) =>
  useQuery({
    queryKey: adminCatalogKeys.detail(itemId),
    queryFn: () => adminApi.getCatalogItem(itemId),
    enabled: Number.isInteger(itemId) && itemId > 0,
  })

export const useAdminCatalogActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      action,
      reason,
    }: {
      itemId: number
      action: AdminCatalogAction
      reason?: string
    }) => adminApi.applyCatalogAction(itemId, action, reason),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCatalogKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminCatalogKeys.detail(variables.itemId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
    meta: {
      errorMessage: "Не удалось изменить статус позиции",
    },
  })
}
