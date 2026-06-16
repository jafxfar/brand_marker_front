import { API_URL } from "@/lib/api/config"
import { tokenStorage } from "@/lib/api/client"

export const getNotificationsWsUrl = (): string | null => {
  const token = tokenStorage.getAccess()
  if (!token) return null
  const wsBase = API_URL.replace(/^http/i, "ws")
  return `${wsBase}/ws/notifications?token=${encodeURIComponent(token)}`
}
