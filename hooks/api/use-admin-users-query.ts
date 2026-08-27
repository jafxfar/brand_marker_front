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
}

export const useAdminUsersQuery = (params: AdminUsersParams) =>
  useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: () => adminApi.getUsers(params),
    placeholderData: keepPreviousData,
  })

export const useUpdateAdminUserStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: number
      status: AdminUserStatus
    }) => adminApi.updateUserStatus(userId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
    meta: {
      errorMessage: "Не удалось изменить статус пользователя",
    },
  })
}
