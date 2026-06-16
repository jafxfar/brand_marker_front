"use client"

import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useNotificationsQuery } from "@/hooks/api/use-notifications-query"
import type { NotificationRole } from "@/lib/api/notifications"
import type { ApiNotification, Notification, NotificationType } from "@/types/notification"

export type NotificationListItem = {
  id: string
  apiId?: number
  type: NotificationType
  title: string
  body: string
  href?: string
  read: boolean
  createdAt: number
}

const mapApiNotification = (n: ApiNotification): NotificationListItem => ({
  id: `api-${n.id}`,
  apiId: n.id,
  type: n.type,
  title: n.title,
  body: n.body,
  href: n.href ?? undefined,
  read: n.read,
  createdAt: new Date(n.created_at).getTime(),
})

const mapLocalNotification = (n: Notification): NotificationListItem => ({
  id: n.id,
  type: n.type,
  title: n.title,
  body: n.body,
  href: n.href,
  read: n.read,
  createdAt: n.createdAt,
})

export const useNotificationItems = (role: NotificationRole) => {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const { data: apiItems, isLoading } = useNotificationsQuery(role, hydrated && useApi)
  const localItems = useNotificationsStore((s) => s.items)

  if (!hydrated) {
    return { items: [] as NotificationListItem[], isLoading: true, useApi }
  }

  if (useApi) {
    return {
      items: (apiItems ?? []).map(mapApiNotification),
      isLoading,
      useApi,
    }
  }

  return {
    items: localItems.map(mapLocalNotification),
    isLoading: false,
    useApi,
  }
}

export const useUnreadNotificationsCount = (role: NotificationRole) => {
  const { items, isLoading } = useNotificationItems(role)
  if (isLoading) return 0
  return items.filter((n) => !n.read).length
}
