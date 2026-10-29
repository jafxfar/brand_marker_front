import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminCatalogAction,
  type AdminCatalogBulkAction,
  type AdminCatalogDetail,
  type AdminCatalogItemsParams,
  type AdminCatalogItemUpdate,
  type AdminCatalogParams,
} from "@/lib/api/admin"

export const adminCatalogKeys = {
  all: ["admin-catalog"] as const,
  lists: () => [...adminCatalogKeys.all, "list"] as const,
  list: (params: AdminCatalogParams) =>
    [...adminCatalogKeys.lists(), params] as const,
  items: (params: AdminCatalogItemsParams) =>
    [...adminCatalogKeys.lists(), "items", params] as const,
  details: () => [...adminCatalogKeys.all, "detail"] as const,
  detail: (itemId: number) => [...adminCatalogKeys.details(), itemId] as const,
}

export const useAdminCatalogQuery = (params: AdminCatalogParams) =>
  useQuery({
    queryKey: adminCatalogKeys.list(params),
    queryFn: () => adminApi.getCatalog(params),
    placeholderData: keepPreviousData,
  })

export const useAdminCatalogItemsQuery = (params: AdminCatalogItemsParams) =>
  useQuery({
    queryKey: adminCatalogKeys.items(params),
    queryFn: () => adminApi.getCatalogItems(params),
    placeholderData: keepPreviousData,
  })

const useCatalogDetailMutation = <TVariables>(
  itemId: number,
  mutationFn: (variables: TVariables) => Promise<AdminCatalogDetail>,
  errorMessage: string,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (detail) => {
      queryClient.setQueryData(adminCatalogKeys.detail(itemId), detail)
      await queryClient.invalidateQueries({ queryKey: adminCatalogKeys.lists() })
    },
    meta: { errorMessage },
  })
}

export const useAdminCatalogUpdateMutation = (itemId: number) =>
  useCatalogDetailMutation(
    itemId,
    (data: AdminCatalogItemUpdate) => adminApi.updateCatalogItem(itemId, data),
    "Не удалось сохранить изменения",
  )

export const useAdminCatalogMediaUploadMutation = (itemId: number) =>
  useCatalogDetailMutation(
    itemId,
    (file: File) => adminApi.uploadCatalogMedia(itemId, file),
    "Не удалось загрузить файл",
  )

export const useAdminCatalogMediaDeleteMutation = (itemId: number) =>
  useCatalogDetailMutation(
    itemId,
    (mediaId: number) => adminApi.deleteCatalogMedia(itemId, mediaId),
    "Не удалось удалить файл",
  )

export const useAdminCatalogMediaReorderMutation = (itemId: number) =>
  useCatalogDetailMutation(
    itemId,
    (mediaIds: number[]) => adminApi.reorderCatalogMedia(itemId, mediaIds),
    "Не удалось изменить порядок файлов",
  )

export const useAdminCatalogBulkActionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ids,
      action,
      reason,
    }: {
      ids: number[]
      action: AdminCatalogBulkAction
      reason?: string
    }) => adminApi.bulkCatalogAction(ids, action, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCatalogKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
    meta: { errorMessage: "Не удалось выполнить массовое действие" },
  })
}

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
