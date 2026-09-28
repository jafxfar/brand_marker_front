import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { publicKeys } from "@/hooks/api/use-public-query"
import { adminApi } from "@/lib/api/admin"
import type { PlatformSettingsInput } from "@/lib/api/public"

export const adminSettingsKeys = {
  all: ["admin-settings"] as const,
  detail: () => [...adminSettingsKeys.all, "detail"] as const,
}

export const useAdminSettingsQuery = () =>
  useQuery({
    queryKey: adminSettingsKeys.detail(),
    queryFn: adminApi.getSettings,
  })

export const useUpdateAdminSettingsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlatformSettingsInput) => adminApi.updateSettings(data),
    onSuccess: async (data) => {
      queryClient.setQueryData(adminSettingsKeys.detail(), data)
      await queryClient.invalidateQueries({ queryKey: publicKeys.platformSettings() })
    },
    meta: {
      successMessage: "Настройки сохранены",
      errorMessage: "Не удалось сохранить настройки",
    },
  })
}
