import type { QueryClient } from "@tanstack/react-query"
import type { ContractWithRelations, Message } from "@/types"

const detailKeysFor = (contractId: number) => [
  ["contracts", "detail", contractId] as const,
  ["supplier-contracts", "detail", contractId] as const,
]

const listKeys = [
  ["contracts", "list"] as const,
  ["supplier-contracts", "list"] as const,
]

const normalizeIncomingMessage = (
  contractId: number,
  raw: Partial<Message> & { id: number; sender_id: number; text: string },
): Message => ({
  id: raw.id,
  conversation_id: raw.conversation_id ?? contractId,
  sender_id: raw.sender_id,
  sender_name: raw.sender_name,
  text: raw.text,
  attachment: raw.attachment ?? null,
  created_at: raw.created_at,
  status: raw.status ?? "sent",
  delivered_at: raw.delivered_at ?? null,
  viewed_at: raw.viewed_at ?? null,
})

const patchContractMessages = (
  contract: ContractWithRelations,
  updater: (messages: Message[]) => Message[],
): ContractWithRelations => {
  if (!contract.conversation) {
    return {
      ...contract,
      conversation: {
        id: contract.id,
        contract_id: contract.id,
        messages: updater([]),
      },
    }
  }
  return {
    ...contract,
    conversation: {
      ...contract.conversation,
      messages: updater(contract.conversation.messages ?? []),
    },
  }
}

export const appendContractMessageToCache = (
  queryClient: QueryClient,
  contractId: number,
  rawMessage: Partial<Message> & { id: number; sender_id: number; text: string },
) => {
  const message = normalizeIncomingMessage(contractId, rawMessage)
  for (const key of detailKeysFor(contractId)) {
    queryClient.setQueryData<ContractWithRelations>(key, (current) => {
      if (!current) return current
      return patchContractMessages(current, (messages) => {
        if (messages.some((m) => m.id === message.id)) {
          return messages.map((m) => (m.id === message.id ? { ...m, ...message } : m))
        }
        return [...messages, message]
      })
    })
  }
  for (const key of listKeys) {
    queryClient.setQueryData<ContractWithRelations[]>(key, (list) => {
      if (!list) return list
      return list.map((contract) => {
        if (contract.id !== contractId) return contract
        return patchContractMessages(contract, (messages) => {
          if (messages.some((m) => m.id === message.id)) {
            return messages.map((m) => (m.id === message.id ? { ...m, ...message } : m))
          }
          return [...messages, message]
        })
      })
    })
  }
}

export const updateContractMessageStatusInCache = (
  queryClient: QueryClient,
  contractId: number,
  updates: Array<Partial<Message> & { id: number }>,
) => {
  if (updates.length === 0) return
  const byId = new Map(updates.map((item) => [item.id, item]))

  for (const key of detailKeysFor(contractId)) {
    queryClient.setQueryData<ContractWithRelations>(key, (current) => {
      if (!current?.conversation) return current
      return patchContractMessages(current, (messages) =>
        messages.map((message) => {
          const patch = byId.get(message.id)
          return patch ? { ...message, ...patch } : message
        }),
      )
    })
  }

  for (const key of listKeys) {
    queryClient.setQueryData<ContractWithRelations[]>(key, (list) => {
      if (!list) return list
      return list.map((contract) => {
        if (contract.id !== contractId || !contract.conversation) return contract
        return patchContractMessages(contract, (messages) =>
          messages.map((message) => {
            const patch = byId.get(message.id)
            return patch ? { ...message, ...patch } : message
          }),
        )
      })
    })
  }
}

export const replaceContractInCache = (
  queryClient: QueryClient,
  contract: ContractWithRelations,
) => {
  queryClient.setQueryData(["contracts", "detail", contract.id], contract)
  queryClient.setQueryData(["supplier-contracts", "detail", contract.id], contract)
  for (const key of listKeys) {
    queryClient.setQueryData<ContractWithRelations[]>(key, (list) => {
      if (!list) return list
      return list.map((item) => (item.id === contract.id ? contract : item))
    })
  }
}
