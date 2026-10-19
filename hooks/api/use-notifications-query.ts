import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  notificationsApi,
  type NotificationRole,
} from "@/lib/api/notifications"
import { isApiEnabled } from "@/lib/api/config"
import { emptyPage, type Page, type PageParams } from "@/lib/pagination"
import type { ApiNotification } from "@/types/notification"

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (role: NotificationRole, page = 1) =>
    [...notificationKeys.all, role, page] as const,
}

export const useNotificationsQuery = (
  role: NotificationRole,
  enabled = true,
  params: PageParams = {},
) =>
  useQuery({
    queryKey: notificationKeys.list(role, params.page ?? 1),
    queryFn: () => notificationsApi.list(role, params),
    enabled: enabled && isApiEnabled(),
  })

export const useMarkNotificationReadMutation = (role: NotificationRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(role, id),
    onSuccess: (_data, id) => {
      qc.setQueriesData<Page<ApiNotification>>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
          }
        },
      )
    },
    meta: { silent: true },
  })
}

export const useMarkAllNotificationsReadMutation = (role: NotificationRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(role),
    onSuccess: () => {
      qc.setQueriesData<Page<ApiNotification>>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((n) => ({ ...n, read: true })),
          }
        },
      )
    },
    meta: {
      successMessage: "Все уведомления прочитаны",
      errorMessage: "Не удалось отметить уведомления",
    },
  })
}

export const prependNotificationToCache = (
  qc: ReturnType<typeof useQueryClient>,
  role: NotificationRole,
  notification: ApiNotification,
) => {
  qc.setQueriesData<Page<ApiNotification>>(
    { queryKey: [...notificationKeys.all, role] },
    (old) => {
      const page = old ?? emptyPage<ApiNotification>()
      if (page.items.some((n) => n.id === notification.id)) return page
      return {
        ...page,
        items: [notification, ...page.items],
        total: page.total + 1,
      }
    },
  )
}
