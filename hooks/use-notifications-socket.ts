"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { NotificationRole } from "@/lib/api/notifications"
import { contractsApi } from "@/lib/api/contracts"
import { supplierContractsApi } from "@/lib/api/supplier/contracts"
import { isApiEnabled } from "@/lib/api/config"
import { ensureAccessToken } from "@/lib/api/client"
import { getNotificationsWsUrl } from "@/lib/notifications-ws"
import {
  prependNotificationToCache,
} from "@/hooks/api/use-notifications-query"
import {
  appendContractMessageToCache,
  updateContractMessageStatusInCache,
} from "@/lib/contract-chat-cache"
import { useAuthStore } from "@/lib/store/auth-store"
import type { ApiNotification } from "@/types/notification"
import type { Message } from "@/types"

type ContractMessagePayload = {
  contract_id: number
  message?: Message
  messages?: Message[]
}

type WsPayload = {
  event: string
  data?: ApiNotification | ContractMessagePayload
}

const ackInFlight = new Set<string>()

export const useNotificationsSocket = (
  role: NotificationRole,
  enabled = true,
) => {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.userId ?? 0)
  const reconnectAttempt = useRef(0)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled || !isApiEnabled()) return

    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined

    const ackDelivered = async (contractId: number, messageId: number) => {
      const key = `${role}:${contractId}:${messageId}`
      if (ackInFlight.has(key)) return
      ackInFlight.add(key)
      try {
        const api = role === "buyer" ? contractsApi : supplierContractsApi
        const updated = await api.markMessageDelivered(contractId, messageId)
        updateContractMessageStatusInCache(queryClient, contractId, [updated])
      } catch {
        // ignore ack failures; status may already be delivered/viewed
      } finally {
        ackInFlight.delete(key)
      }
    }

    const connect = async () => {
      if (cancelled) return
      const token = await ensureAccessToken()
      if (!token || cancelled) return

      const socket = new WebSocket(getNotificationsWsUrl(token))
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
            prependNotificationToCache(queryClient, role, payload.data as ApiNotification)
            return
          }
          if (payload.event === "contract.message" && payload.data) {
            const data = payload.data as ContractMessagePayload
            if (!data.contract_id || !data.message) return
            appendContractMessageToCache(queryClient, data.contract_id, data.message)
            if (userId > 0 && data.message.sender_id !== userId) {
              void ackDelivered(data.contract_id, data.message.id)
            }
            return
          }
          if (payload.event === "contract.message.status" && payload.data) {
            const data = payload.data as ContractMessagePayload
            if (!data.contract_id) return
            const updates = data.messages?.length
              ? data.messages
              : data.message
                ? [data.message]
                : []
            updateContractMessageStatusInCache(queryClient, data.contract_id, updates)
          }
        } catch {
          // ignore malformed messages
        }
      }

      socket.onclose = (event) => {
        socketRef.current = null
        if (cancelled) return
        const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000)
        reconnectAttempt.current += 1
        reconnectTimer = setTimeout(() => {
          if (event.code === 4401) {
            void ensureAccessToken(true).then((token) => {
              if (!token || cancelled) return
              void connect()
            })
            return
          }
          void connect()
        }, delay)
      }
    }

    void connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [enabled, role, queryClient, userId])

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
