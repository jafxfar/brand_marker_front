import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { adminRoleKeys } from "@/hooks/api/use-admin-roles-query"
import { getAdminAccessErrorMessage } from "@/lib/admin-access-errors"
import {
  adminApi,
  type AdminStaffCreateInput,
  type AdminStaffUpdateInput,
} from "@/lib/api/admin"

export const adminStaffKeys = {
  all: ["admin-staff"] as const,
  list: (query: string) => [...adminStaffKeys.all, "list", query] as const,
}

const toastAccessError = (fallback: string) => (error: unknown) => {
  toast.error(getAdminAccessErrorMessage(error, fallback))
}

export const useAdminStaffQuery = (query: string) =>
  useQuery({
    queryKey: adminStaffKeys.list(query),
    queryFn: () => adminApi.getStaff(query),
    placeholderData: keepPreviousData,
  })

export const useCreateAdminStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminStaffCreateInput) => adminApi.createStaff(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminStaffKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminRoleKeys.list() }),
      ])
    },
    onError: toastAccessError("Не удалось создать сотрудника"),
    meta: {
      silent: true,
    },
  })
}

export const useUpdateAdminStaffMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: AdminStaffUpdateInput }) =>
      adminApi.updateStaff(userId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminStaffKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminRoleKeys.list() }),
      ])
    },
    onError: toastAccessError("Не удалось сохранить сотрудника"),
    meta: {
      silent: true,
    },
  })
}
