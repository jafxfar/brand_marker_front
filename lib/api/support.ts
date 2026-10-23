import type {
  SupportMessage,
  SupportTicket,
  SupportTicketResponse,
} from "@/types/support"
import { apiFetch } from "./client"

export type SupportRole = "buyer" | "supplier"

const prefixFor = (role: SupportRole) =>
  role === "buyer" ? "/buyer/support" : "/supplier/support"

export const supportApi = {
  getTicket: (role: SupportRole) =>
    apiFetch<SupportTicketResponse>(`${prefixFor(role)}/ticket`),

  createTicket: (role: SupportRole) =>
    apiFetch<SupportTicket>(`${prefixFor(role)}/ticket`, { method: "POST" }),

  unreadCount: (role: SupportRole) =>
    apiFetch<{ count: number }>(`${prefixFor(role)}/unread-count`),

  sendMessage: (role: SupportRole, ticketId: number, text: string, file?: File | null) => {
    const form = new FormData()
    if (text) form.append("text", text)
    if (file) form.append("file", file)
    return apiFetch<SupportMessage>(`${prefixFor(role)}/ticket/${ticketId}/messages`, {
      method: "POST",
      body: form,
    })
  },

  markDelivered: (role: SupportRole, ticketId: number, messageId: number) =>
    apiFetch<SupportMessage>(
      `${prefixFor(role)}/ticket/${ticketId}/messages/${messageId}/delivered`,
      { method: "POST" },
    ),

  markRead: (role: SupportRole, ticketId: number) =>
    apiFetch<{ message_ids: number[]; messages?: SupportMessage[] }>(
      `${prefixFor(role)}/ticket/${ticketId}/messages/read`,
      { method: "POST" },
    ),

  closeTicket: (role: SupportRole, ticketId: number) =>
    apiFetch<SupportTicket>(`${prefixFor(role)}/ticket/${ticketId}/close`, {
      method: "POST",
    }),
}
