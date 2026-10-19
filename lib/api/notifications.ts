import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type { ApiNotification } from "@/types/notification"
import { apiFetch } from "./client"

export type NotificationRole = "buyer" | "supplier"

const prefixFor = (role: NotificationRole) =>
  role === "buyer" ? "/buyer/notifications" : "/supplier/notifications"

export const notificationsApi = {
  list: (role: NotificationRole, params: PageParams = {}) =>
    apiFetch<Page<ApiNotification>>(`${prefixFor(role)}/${buildPageQuery(params)}`),

  markRead: (role: NotificationRole, id: number) =>
    apiFetch<{ id: number; read: boolean }>(`${prefixFor(role)}/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: (role: NotificationRole) =>
    apiFetch<void>(`${prefixFor(role)}/read-all`, { method: "POST" }),
}
