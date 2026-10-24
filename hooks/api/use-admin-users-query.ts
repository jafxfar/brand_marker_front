import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminApi,
  type AdminUsersParams,
  type AdminUserStatus,
} from "@/lib/api/admin"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"

export const adminUsersKeys = {
  all: ["admin-users"] as const,
  list: (params: AdminUsersParams) => [...adminUsersKeys.all, "list", params] as const,
  detail: (userId: number) => [...adminUsersKeys.all, "detail", userId] as const,
}

export const useAdminUsersQuery = (params: AdminUsersParams) =>
  useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: () => adminApi.getUsers(params),
    placeholderData: keepPreviousData,
  })

export const useAdminUserQuery = (userId: number) =>
  useQuery({
    queryKey: adminUsersKeys.detail(userId),
    queryFn: () => adminApi.getUser(userId),
    enabled: Number.isInteger(userId) && userId > 0,
  })

export const useUpdateAdminUserStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      status,
      reason,
    }: {
      userId: number
      status: AdminUserStatus
      reason?: string | null
    }) => adminApi.updateUserStatus(userId, status, reason),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.all }),
        queryClient.invalidateQueries({
          queryKey: adminUsersKeys.detail(variables.userId),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
    meta: {
      errorMessage: "Не удалось изменить статус пользователя",
    },
  })
}
