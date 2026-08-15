import { API_URL } from "@/lib/api/config"

export const getNotificationsWsUrl = (accessToken: string): string => {
  const wsBase = API_URL.replace(/^http/i, "ws")
  return `${wsBase}/ws/notifications?token=${encodeURIComponent(accessToken)}`
}
