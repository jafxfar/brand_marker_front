"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { NotificationRole } from "@/lib/api/notifications"
import { isApiEnabled } from "@/lib/api/config"
import { tokenStorage } from "@/lib/api/client"
import { getNotificationsWsUrl } from "@/lib/notifications-ws"
import {
  notificationKeys,
  prependNotificationToCache,
} from "@/hooks/api/use-notifications-query"
import type { ApiNotification } from "@/types/notification"

type WsPayload = {
  event: string
  data?: ApiNotification
}

export const useNotificationsSocket = (
  role: NotificationRole,
  enabled = true,
) => {
  const queryClient = useQueryClient()
  const reconnectAttempt = useRef(0)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled || !isApiEnabled()) return

    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      if (cancelled) return
      const url = getNotificationsWsUrl()
      if (!url) return

      const socket = new WebSocket(url)
      socketRef.current = socket

      socket.onopen = () => {
        reconnectAttempt.current = 0
      }

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as WsPayload
          if (payload.event === "ping") {
            socket.send("pong")
            return
          }
          if (payload.event === "notification.created" && payload.data) {
            prependNotificationToCache(queryClient, role, payload.data)
          }
        } catch {
          // ignore malformed messages
        }
      }

      socket.onclose = () => {
        socketRef.current = null
        if (cancelled) return
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000)
        reconnectAttempt.current += 1
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [enabled, role, queryClient])

  useEffect(() => {
    if (!enabled || !isApiEnabled()) return
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "bm-access-token") return
      socketRef.current?.close()
      reconnectAttempt.current = 0
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [enabled])
}
