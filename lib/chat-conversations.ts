import type { ContractWithRelations, Message } from "@/types"

export type ChatConversationItem = {
  contract: ContractWithRelations
  lastMessage: Message
  senderName: string
  counterpartName: string
  unreadCount: number
}

const messageSortKey = (message: Message): number => {
  if (message.created_at) {
    const ts = new Date(message.created_at).getTime()
    if (!Number.isNaN(ts)) return ts
  }
  return message.id
}

export const countUnreadMessages = (
  messages: Message[],
  currentUserId: number,
): number =>
  messages.filter(
    (message) =>
      message.sender_id !== currentUserId && message.status !== "viewed",
  ).length

export const buildChatConversations = (
  contracts: ContractWithRelations[],
  currentUserId: number,
  getCounterpartName: (contract: ContractWithRelations) => string,
): ChatConversationItem[] =>
  contracts
    .filter((contract) => (contract.conversation?.messages.length ?? 0) > 0)
    .map((contract) => {
      const messages = contract.conversation!.messages
      const lastMessage = messages[messages.length - 1]!
      const isOwn = lastMessage.sender_id === currentUserId
      const counterpartName = getCounterpartName(contract)
      const senderName = isOwn
        ? "Вы"
        : (lastMessage.sender_name?.trim() || counterpartName)
      return {
        contract,
        lastMessage,
        senderName,
        counterpartName,
        unreadCount: countUnreadMessages(messages, currentUserId),
      }
    })
    .sort(
      (a, b) => messageSortKey(b.lastMessage) - messageSortKey(a.lastMessage),
    )

export const filterChatConversations = (
  conversations: ChatConversationItem[],
  query: string,
): ChatConversationItem[] => {
  const q = query.trim().toLowerCase()
  if (!q) return conversations
  return conversations.filter((item) => {
    const haystack = [
      item.contract.title,
      item.counterpartName,
      item.senderName,
      item.lastMessage.text,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}
