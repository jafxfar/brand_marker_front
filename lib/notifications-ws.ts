import { API_URL } from "@/lib/api/config"

export const getNotificationsWsUrl = (accessToken: string): string => {
  const token = encodeURIComponent(accessToken)

  if (API_URL.startsWith("/")) {
    const isSecure =
      typeof window !== "undefined" && window.location.protocol === "https:"
    const protocol = isSecure ? "wss" : "ws"
    const host =
      typeof window !== "undefined" ? window.location.host : "localhost:4000"
    return `${protocol}://${host}${API_URL}/ws/notifications?token=${token}`
  }

  const wsBase = API_URL.replace(/^http/i, "ws")
  return `${wsBase}/ws/notifications?token=${token}`
}
