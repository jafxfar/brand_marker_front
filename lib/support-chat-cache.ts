import type { QueryClient } from "@tanstack/react-query"
import type { Page } from "@/lib/pagination"
import type {
  SupportMessage,
  SupportTicket,
  SupportTicketDetail,
  SupportTicketListItem,
  SupportTicketResponse,
} from "@/types/support"

export const supportKeys = {
  all: ["support"] as const,
  ticket: (role: string) => ["support", "ticket", role] as const,
  unread: (role: string) => ["support", "unread", role] as const,
  adminList: (status: string) => ["support", "admin-list", status] as const,
  adminDetail: (id: number) => ["support", "admin-detail", id] as const,
  adminUnread: ["support", "admin-unread"] as const,
}

const mergeMessages = (
  cached: SupportMessage[],
  incoming: SupportMessage[],
): SupportMessage[] => {
  const byId = new Map<number, SupportMessage>()
  for (const message of cached) byId.set(message.id, message)
  for (const message of incoming) {
    const existing = byId.get(message.id)
    byId.set(message.id, existing ? { ...existing, ...message } : message)
  }
  return [...byId.values()].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    if (aTime !== bTime) return aTime - bTime
    return a.id - b.id
  })
}

const normalizeMessage = (
  ticketId: number,
  raw: Partial<SupportMessage> & { id: number; sender_id: number },
): SupportMessage => ({
  id: raw.id,
  ticket_id: raw.ticket_id ?? ticketId,
  sender_id: raw.sender_id,
  sender_name: raw.sender_name,
  text: raw.text ?? "",
  attachment: raw.attachment ?? null,
  created_at: raw.created_at,
  status: raw.status ?? "sent",
  delivered_at: raw.delivered_at ?? null,
  viewed_at: raw.viewed_at ?? null,
})

export const appendSupportMessageToCache = (
  queryClient: QueryClient,
  ticketId: number,
  rawMessage: Partial<SupportMessage> & { id: number; sender_id: number },
  role?: string,
) => {
  const message = normalizeMessage(ticketId, rawMessage)

  if (role) {
    queryClient.setQueryData<SupportTicketResponse>(supportKeys.ticket(role), (current) => {
      if (!current?.ticket || current.ticket.id !== ticketId) return current
      const messages = mergeMessages(current.ticket.messages ?? [], [message])
      return {
        ticket: {
          ...current.ticket,
          messages,
          last_message_at: message.created_at ?? current.ticket.last_message_at,
        },
      }
    })
  }

  queryClient.setQueryData<SupportTicketDetail>(supportKeys.adminDetail(ticketId), (current) => {
    if (!current) return current
    return {
      ...current,
      messages: mergeMessages(current.messages ?? [], [message]),
      last_message_at: message.created_at ?? current.last_message_at,
      last_message_preview: message.text || message.attachment?.file_name || current.last_message_preview,
    }
  })

  for (const status of ["open", "closed", "all"]) {
    queryClient.setQueriesData<Page<SupportTicketListItem>>(
      { queryKey: supportKeys.adminList(status) },
      (page) => {
        if (!page) return page
        return {
          ...page,
          items: page.items.map((item) =>
            item.id === ticketId
              ? {
                  ...item,
                  last_message_at: message.created_at ?? item.last_message_at,
                  last_message_preview:
                    message.text || message.attachment?.file_name || item.last_message_preview,
                }
              : item,
          ),
        }
      },
    )
  }
}

export const updateSupportMessageStatusInCache = (
  queryClient: QueryClient,
  ticketId: number,
  updates: Array<Partial<SupportMessage> & { id: number }>,
  role?: string,
) => {
  if (updates.length === 0) return
  const byId = new Map(updates.map((item) => [item.id, item]))

  const patchMessages = (messages: SupportMessage[]) =>
    messages.map((message) => {
      const patch = byId.get(message.id)
      return patch ? { ...message, ...patch } : message
    })

  if (role) {
    queryClient.setQueryData<SupportTicketResponse>(supportKeys.ticket(role), (current) => {
      if (!current?.ticket || current.ticket.id !== ticketId) return current
      return {
        ticket: {
          ...current.ticket,
          messages: patchMessages(current.ticket.messages ?? []),
        },
      }
    })
  }

  queryClient.setQueryData<SupportTicketDetail>(supportKeys.adminDetail(ticketId), (current) => {
    if (!current) return current
    return { ...current, messages: patchMessages(current.messages ?? []) }
  })
}

export const replaceSupportTicketInCache = (
  queryClient: QueryClient,
  role: string,
  ticket: SupportTicket | null,
) => {
  queryClient.setQueryData<SupportTicketResponse>(supportKeys.ticket(role), { ticket })
}
