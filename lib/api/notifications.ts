import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type { ApiNotification } from "@/types/notification"
import { apiFetch } from "./client"

export type NotificationRole = "buyer" | "supplier"

export type NotificationListParams = PageParams & {
  /** true = только непрочитанные, false = только прочитанные, undefined = все */
  unread?: boolean
}

const prefixFor = (role: NotificationRole) =>
  role === "buyer" ? "/buyer/notifications" : "/supplier/notifications"

export const notificationsApi = {
  list: (role: NotificationRole, params: NotificationListParams = {}) =>
    apiFetch<Page<ApiNotification>>(
      `${prefixFor(role)}/${buildPageQuery({
        page: params.page,
        pageSize: params.pageSize,
        unread: params.unread,
      })}`,
    ),

  markRead: (role: NotificationRole, id: number) =>
    apiFetch<{ id: number; read: boolean }>(`${prefixFor(role)}/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: (role: NotificationRole) =>
    apiFetch<void>(`${prefixFor(role)}/read-all`, { method: "POST" }),
}
