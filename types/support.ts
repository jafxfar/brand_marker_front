import type { MessageDeliveryStatus } from "@/types/contract"

export type SupportTicketStatus = "open" | "closed"
export type SupportSide = "buyer" | "supplier"

export type SupportAttachment = {
  id: number
  message_id: number
  file_name: string
  file_url: string
  file_type: string
}

export type SupportMessage = {
  id: number
  ticket_id: number
  sender_id: number
  sender_name?: string
  text: string
  attachment: SupportAttachment | null
  created_at?: string | null
  status?: MessageDeliveryStatus
  delivered_at?: string | null
  viewed_at?: string | null
}

export type SupportTicket = {
  id: number
  user_id: number
  side: SupportSide
  status: SupportTicketStatus
  assigned_admin_id: number | null
  last_message_at: string | null
  created_at: string
  closed_at: string | null
  unread_count: number
  messages: SupportMessage[]
}

export type SupportTicketListItem = {
  id: number
  user_id: number
  user_name: string
  user_email: string
  side: SupportSide
  status: SupportTicketStatus
  assigned_admin_id: number | null
  last_message_at: string | null
  created_at: string
  closed_at: string | null
  unread_count: number
  last_message_preview: string
}

export type SupportTicketDetail = SupportTicketListItem & {
  messages: SupportMessage[]
}

export type SupportTicketResponse = {
  ticket: SupportTicket | null
}
