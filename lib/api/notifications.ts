import type { ApiNotification } from "@/types/notification"
import { apiFetch } from "./client"

export type NotificationRole = "buyer" | "supplier"

const prefixFor = (role: NotificationRole) =>
  role === "buyer" ? "/buyer/notifications" : "/supplier/notifications"

export const notificationsApi = {
  list: (role: NotificationRole) =>
    apiFetch<ApiNotification[]>(`${prefixFor(role)}/`),

  markRead: (role: NotificationRole, id: number) =>
    apiFetch<{ id: number; read: boolean }>(`${prefixFor(role)}/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: (role: NotificationRole) =>
    apiFetch<void>(`${prefixFor(role)}/read-all`, { method: "POST" }),
}
