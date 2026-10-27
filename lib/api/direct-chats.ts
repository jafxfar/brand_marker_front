import type { DirectChatThread } from "@/types"
import { apiFetch } from "./client"

const buyerPrefix = "/buyer/direct-chats"
const supplierPrefix = "/supplier/direct-chats"

const prefixFor = (role: "buyer" | "supplier") =>
  role === "buyer" ? buyerPrefix : supplierPrefix

export const directChatsApi = {
  list: (role: "buyer" | "supplier") =>
    apiFetch<DirectChatThread[]>(`${prefixFor(role)}/`),

  get: (role: "buyer" | "supplier", id: number) =>
    apiFetch<DirectChatThread>(`${prefixFor(role)}/${id}`),

  openForSupplier: (supplierActorId: number) =>
    apiFetch<DirectChatThread>(`${buyerPrefix}/`, {
      method: "POST",
      body: JSON.stringify({ supplier_actor_id: supplierActorId }),
    }),

  openForBuyer: (buyerActorId: number) =>
    apiFetch<DirectChatThread>(`${supplierPrefix}/`, {
      method: "POST",
      body: JSON.stringify({ buyer_actor_id: buyerActorId }),
    }),

  sendMessage: (role: "buyer" | "supplier", id: number, text: string) =>
    apiFetch<DirectChatThread>(`${prefixFor(role)}/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  markRead: (role: "buyer" | "supplier", id: number) =>
    apiFetch<{ message_ids: number[]; messages?: DirectChatThread["messages"] }>(
      `${prefixFor(role)}/${id}/messages/read`,
      { method: "POST" },
    ),
}
