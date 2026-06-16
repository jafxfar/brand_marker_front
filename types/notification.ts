export const NOTIFICATION_TYPES = [
  "order",
  "offer",
  "payment",
  "system",
  "rfq",
  "contract",
  "proposal",
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type ApiNotification = {
  id: number
  type: NotificationType
  title: string
  body: string
  href: string | null
  read: boolean
  created_at: string
}

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string
  href?: string
  read: boolean
  createdAt: number
}
