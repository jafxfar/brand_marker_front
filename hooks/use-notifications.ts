"use client"

import { useNotificationsStore } from "@/lib/store/notifications-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import {
  useNotificationsQuery,
  type NotificationFilterKey,
} from "@/hooks/api/use-notifications-query"
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

export const useNotificationItems = (
  role: NotificationRole,
  options: {
    page?: number
    pageSize?: number
    filter?: NotificationFilterKey
  } = {},
) => {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 20
  const filter = options.filter ?? "all"

  const { data: apiItems, isLoading } = useNotificationsQuery(
    role,
    hydrated && useApi,
    { page, pageSize, filter },
  )
  const localItems = useNotificationsStore((s) => s.items)

  if (!hydrated) {
    return {
      items: [] as NotificationListItem[],
      isLoading: true,
      useApi,
      total: 0,
      totalPages: 0,
      page: 1,
    }
  }

  if (useApi) {
    return {
      items: (apiItems?.items ?? []).map(mapApiNotification),
      isLoading,
      useApi,
      total: apiItems?.total ?? 0,
      totalPages: apiItems?.total_pages ?? 0,
      page: apiItems?.page ?? page,
    }
  }

  let items = localItems.map(mapLocalNotification)
  if (filter === "unread") items = items.filter((n) => !n.read)
  if (filter === "read") items = items.filter((n) => n.read)
  items = [...items].sort((a, b) => b.createdAt - a.createdAt)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    isLoading: false,
    useApi,
    total,
    totalPages,
    page,
  }
}

export const useUnreadNotificationsCount = (role: NotificationRole) => {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const { data, isLoading } = useNotificationsQuery(role, hydrated && useApi, {
    page: 1,
    pageSize: 1,
    filter: "unread",
  })
  const localItems = useNotificationsStore((s) => s.items)

  if (!hydrated || isLoading) {
    if (!useApi && hydrated) {
      return localItems.filter((n) => !n.read).length
    }
    return 0
  }
  if (useApi) return data?.total ?? 0
  return localItems.filter((n) => !n.read).length
}
