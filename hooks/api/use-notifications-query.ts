import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  notificationsApi,
  type NotificationRole,
} from "@/lib/api/notifications"
import { isApiEnabled } from "@/lib/api/config"
import type { ApiNotification } from "@/types/notification"

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (role: NotificationRole) => [...notificationKeys.all, role] as const,
}

export const useNotificationsQuery = (role: NotificationRole, enabled = true) =>
  useQuery({
    queryKey: notificationKeys.list(role),
    queryFn: () => notificationsApi.list(role),
    enabled: enabled && isApiEnabled(),
  })

export const useMarkNotificationReadMutation = (role: NotificationRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(role, id),
    onSuccess: (_data, id) => {
      qc.setQueryData<ApiNotification[]>(notificationKeys.list(role), (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
    },
  })
}

export const useMarkAllNotificationsReadMutation = (role: NotificationRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(role),
    onSuccess: () => {
      qc.setQueryData<ApiNotification[]>(notificationKeys.list(role), (old) =>
        old?.map((n) => ({ ...n, read: true })),
      )
    },
  })
}

export const prependNotificationToCache = (
  qc: ReturnType<typeof useQueryClient>,
  role: NotificationRole,
  notification: ApiNotification,
) => {
  qc.setQueryData<ApiNotification[]>(notificationKeys.list(role), (old) => {
    if (!old) return [notification]
    if (old.some((n) => n.id === notification.id)) return old
    return [notification, ...old]
  })
}
