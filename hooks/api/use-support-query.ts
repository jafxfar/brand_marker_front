import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminSupportApi, type AdminSupportListParams } from "@/lib/api/admin/support"
import { isApiEnabled } from "@/lib/api/config"
import { supportApi, type SupportRole } from "@/lib/api/support"
import {
  appendSupportMessageToCache,
  replaceSupportTicketInCache,
  supportKeys,
  updateSupportMessageStatusInCache,
} from "@/lib/support-chat-cache"
import type { SupportTicketStatus } from "@/types/support"

export { supportKeys }

export const useSupportTicketQuery = (role: SupportRole, enabled = true) =>
  useQuery({
    queryKey: supportKeys.ticket(role),
    queryFn: () => supportApi.getTicket(role),
    enabled: enabled && isApiEnabled(),
  })

export const useSupportUnreadQuery = (role: SupportRole, enabled = true) =>
  useQuery({
    queryKey: supportKeys.unread(role),
    queryFn: () => supportApi.unreadCount(role),
    enabled: enabled && isApiEnabled(),
    refetchInterval: 60_000,
  })

export const useCreateSupportTicketMutation = (role: SupportRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => supportApi.createTicket(role),
    onSuccess: (ticket) => {
      replaceSupportTicketInCache(qc, role, ticket)
      void qc.invalidateQueries({ queryKey: supportKeys.unread(role) })
    },
    meta: { successMessage: "Обращение создано" },
  })
}

export const useSendSupportMessageMutation = (role: SupportRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      ticketId,
      text,
      file,
    }: {
      ticketId: number
      text: string
      file?: File | null
    }) => supportApi.sendMessage(role, ticketId, text, file),
    onSuccess: (message, vars) => {
      appendSupportMessageToCache(qc, vars.ticketId, message, role)
      void qc.invalidateQueries({ queryKey: supportKeys.unread(role) })
    },
    meta: { errorMessage: "Не удалось отправить сообщение" },
  })
}

export const useMarkSupportReadMutation = (role: SupportRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => supportApi.markRead(role, ticketId),
    onSuccess: (data, ticketId) => {
      if (data.messages?.length) {
        updateSupportMessageStatusInCache(qc, ticketId, data.messages, role)
      }
      void qc.invalidateQueries({ queryKey: supportKeys.unread(role) })
    },
    meta: { silent: true },
  })
}

export const useCloseSupportTicketMutation = (role: SupportRole) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => supportApi.closeTicket(role, ticketId),
    onSuccess: () => {
      replaceSupportTicketInCache(qc, role, null)
      void qc.invalidateQueries({ queryKey: supportKeys.unread(role) })
    },
    meta: { successMessage: "Обращение закрыто" },
  })
}

export const useAdminSupportTicketsQuery = (
  params: AdminSupportListParams = {},
  enabled = true,
) => {
  const status = params.status ?? "open"
  return useQuery({
    queryKey: [
      ...supportKeys.adminList(status),
      params.page ?? 1,
      params.pageSize ?? "",
    ],
    queryFn: () => adminSupportApi.list(params),
    enabled: enabled && isApiEnabled(),
  })
}

export const useAdminSupportTicketQuery = (ticketId: number | null, enabled = true) =>
  useQuery({
    queryKey: supportKeys.adminDetail(ticketId ?? 0),
    queryFn: () => adminSupportApi.get(ticketId!),
    enabled: enabled && isApiEnabled() && ticketId != null && ticketId > 0,
  })

export const useAdminSupportUnreadQuery = (enabled = true) =>
  useQuery({
    queryKey: supportKeys.adminUnread,
    queryFn: () => adminSupportApi.unreadCount(),
    enabled: enabled && isApiEnabled(),
    refetchInterval: 60_000,
  })

export const useAdminSendSupportMessageMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      ticketId,
      text,
      file,
    }: {
      ticketId: number
      text: string
      file?: File | null
    }) => adminSupportApi.sendMessage(ticketId, text, file),
    onSuccess: (message, vars) => {
      appendSupportMessageToCache(qc, vars.ticketId, message)
      void qc.invalidateQueries({ queryKey: supportKeys.adminUnread })
      void qc.invalidateQueries({ queryKey: supportKeys.all })
    },
    meta: { errorMessage: "Не удалось отправить сообщение" },
  })
}

export const useAdminMarkSupportReadMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => adminSupportApi.markRead(ticketId),
    onSuccess: (data, ticketId) => {
      if (data.messages?.length) {
        updateSupportMessageStatusInCache(qc, ticketId, data.messages)
      }
      void qc.invalidateQueries({ queryKey: supportKeys.adminUnread })
    },
    meta: { silent: true },
  })
}

export const useAdminCloseSupportTicketMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => adminSupportApi.closeTicket(ticketId),
    onSuccess: (_ticket, ticketId) => {
      void qc.invalidateQueries({ queryKey: supportKeys.adminDetail(ticketId) })
      void qc.invalidateQueries({ queryKey: supportKeys.all })
    },
    meta: { successMessage: "Тикет закрыт" },
  })
}

export type { SupportTicketStatus }
