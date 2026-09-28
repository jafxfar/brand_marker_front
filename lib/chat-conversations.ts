import type { ContractWithRelations, Message } from "@/types"

export type ChatConversationItem = {
  contract: ContractWithRelations
  lastMessage: Message | null
  senderName: string
  counterpartName: string
  unreadCount: number
}

export type CounterpartChatGroup = {
  counterpartId: number
  counterpartName: string
  projects: ChatConversationItem[]
  lastMessage: Message
  senderName: string
  unreadCount: number
}

const messageSortKey = (message: Message): number => {
  if (message.created_at) {
    const ts = new Date(message.created_at).getTime()
    if (!Number.isNaN(ts)) return ts
  }
  return message.id
}

const conversationSortKey = (item: ChatConversationItem): number =>
  item.lastMessage ? messageSortKey(item.lastMessage) : Number.NEGATIVE_INFINITY

export const countUnreadMessages = (
  messages: Message[],
  currentUserId: number,
): number =>
  messages.filter(
    (message) =>
      message.sender_id !== currentUserId && message.status !== "viewed",
  ).length

const toConversationItem = (
  contract: ContractWithRelations,
  currentUserId: number,
  counterpartName: string,
): ChatConversationItem => {
  const messages = contract.conversation?.messages ?? []
  const lastMessage = messages[messages.length - 1] ?? null
  const senderName = !lastMessage
    ? ""
    : lastMessage.sender_id === currentUserId
      ? "Вы"
      : (lastMessage.sender_name?.trim() || counterpartName)
  return {
    contract,
    lastMessage,
    senderName,
    counterpartName,
    unreadCount: countUnreadMessages(messages, currentUserId),
  }
}

export const buildChatConversations = (
  contracts: ContractWithRelations[],
  currentUserId: number,
  getCounterpartName: (contract: ContractWithRelations) => string,
): ChatConversationItem[] =>
  contracts
    .filter((contract) => (contract.conversation?.messages.length ?? 0) > 0)
    .map((contract) =>
      toConversationItem(contract, currentUserId, getCounterpartName(contract)),
    )
    .sort((a, b) => conversationSortKey(b) - conversationSortKey(a))

export const groupChatsByCounterpart = (
  contracts: ContractWithRelations[],
  currentUserId: number,
  getCounterpartId: (contract: ContractWithRelations) => number,
  getCounterpartName: (contract: ContractWithRelations) => string,
): CounterpartChatGroup[] => {
  const byCounterpart = new Map<number, ChatConversationItem[]>()
  contracts.forEach((contract) => {
    const counterpartId = getCounterpartId(contract)
    const item = toConversationItem(contract, currentUserId, getCounterpartName(contract))
    const items = byCounterpart.get(counterpartId) ?? []
    items.push(item)
    byCounterpart.set(counterpartId, items)
  })

  const groups: CounterpartChatGroup[] = []
  byCounterpart.forEach((items, counterpartId) => {
    const projects = [...items].sort(
      (a, b) => conversationSortKey(b) - conversationSortKey(a),
    )
    const latest = projects[0]
    if (!latest?.lastMessage) return
    groups.push({
      counterpartId,
      counterpartName: latest.counterpartName,
      projects,
      lastMessage: latest.lastMessage,
      senderName: latest.senderName,
      unreadCount: projects.reduce((sum, project) => sum + project.unreadCount, 0),
    })
  })

  return groups.sort(
    (a, b) => messageSortKey(b.lastMessage) - messageSortKey(a.lastMessage),
  )
}

export const pickDefaultProject = (
  group: CounterpartChatGroup,
): ChatConversationItem | undefined =>
  group.projects.find((project) => project.unreadCount > 0) ?? group.projects[0]

export const filterChatGroups = (
  groups: CounterpartChatGroup[],
  query: string,
): CounterpartChatGroup[] => {
  const q = query.trim().toLowerCase()
  if (!q) return groups
  return groups.filter((group) => {
    const haystack = [
      group.counterpartName,
      ...group.projects.map((project) => project.contract.title),
      group.senderName,
      group.lastMessage.text,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}
