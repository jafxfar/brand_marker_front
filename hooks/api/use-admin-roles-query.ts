import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getAdminAccessErrorMessage } from "@/lib/admin-access-errors"
import { adminApi, type AdminRoleInput } from "@/lib/api/admin"

import { DEFAULT_PAGE_SIZE, type PageParams } from "@/lib/pagination"

export const adminRoleKeys = {
  all: ["admin-roles"] as const,
  list: (page = 1) => [...adminRoleKeys.all, "list", page] as const,
  matrix: (roleId: number) => [...adminRoleKeys.all, "matrix", roleId] as const,
}

const toastAccessError = (fallback: string) => (error: unknown) => {
  toast.error(getAdminAccessErrorMessage(error, fallback))
}

export const useAdminRolesQuery = (enabled = true, params: PageParams = {}) =>
  useQuery({
    queryKey: adminRoleKeys.list(params.page ?? 1),
    queryFn: () =>
      adminApi.getRoles({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      }),
    enabled,
  })

export const useAdminRoleMatrixQuery = (roleId: number | null) =>
  useQuery({
    queryKey: adminRoleKeys.matrix(roleId ?? 0),
    queryFn: () => adminApi.getRoleMatrix(roleId as number),
    enabled: Boolean(roleId),
  })

export const useCreateAdminRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminRoleInput) => adminApi.createRole(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRoleKeys.list() })
    },
    onError: toastAccessError("Не удалось создать роль"),
    meta: {
      silent: true,
    },
  })
}

export const useUpdateAdminRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: Partial<AdminRoleInput> }) =>
      adminApi.updateRole(roleId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRoleKeys.all })
    },
    onError: toastAccessError("Не удалось сохранить роль"),
    meta: {
      silent: true,
    },
  })
}

export const useDeleteAdminRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: number) => adminApi.deleteRole(roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRoleKeys.list() })
    },
    onError: toastAccessError("Не удалось удалить роль"),
    meta: {
      silent: true,
    },
  })
}

export const useUpdateAdminRoleMatrixMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      adminApi.updateRoleMatrix(roleId, permissionIds),
    onSuccess: (data) => {
      queryClient.setQueryData(adminRoleKeys.matrix(data.role_id), data)
      toast.success("Права роли сохранены")
    },
    onError: toastAccessError("Не удалось сохранить права роли"),
    meta: {
      silent: true,
    },
  })
}
