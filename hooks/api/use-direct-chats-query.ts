import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { directChatsApi } from "@/lib/api/direct-chats"
import { isApiEnabled } from "@/lib/api/config"
import { navCountsKeys } from "@/hooks/api/use-nav-counts-query"
import type { DirectChatThread } from "@/types"

export const directChatKeys = {
  all: ["direct-chats"] as const,
  list: (role: "buyer" | "supplier") => [...directChatKeys.all, "list", role] as const,
  detail: (role: "buyer" | "supplier", id: number) =>
    [...directChatKeys.all, "detail", role, id] as const,
}

export const useDirectChatsQuery = (role: "buyer" | "supplier", enabled = true) =>
  useQuery({
    queryKey: directChatKeys.list(role),
    queryFn: () => directChatsApi.list(role),
    enabled: enabled && isApiEnabled(),
  })

export const useDirectChatQuery = (
  role: "buyer" | "supplier",
  id: number,
  enabled = true,
) =>
  useQuery({
    queryKey: directChatKeys.detail(role, id),
    queryFn: () => directChatsApi.get(role, id),
    enabled: enabled && isApiEnabled() && id > 0,
  })

export const useOpenDirectChatMutation = (role: "buyer" | "supplier") => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (counterpartActorId: number) =>
      role === "buyer"
        ? directChatsApi.openForSupplier(counterpartActorId)
        : directChatsApi.openForBuyer(counterpartActorId),
    onSuccess: (thread) => {
      qc.setQueryData(directChatKeys.detail(role, thread.id), thread)
      void qc.invalidateQueries({ queryKey: directChatKeys.list(role) })
    },
    meta: { silent: true },
  })
}

export const useSendDirectMessageMutation = (role: "buyer" | "supplier") => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      directChatsApi.sendMessage(role, id, text),
    onSuccess: (thread) => {
      qc.setQueryData(directChatKeys.detail(role, thread.id), thread)
      void qc.invalidateQueries({ queryKey: directChatKeys.list(role) })
      void qc.invalidateQueries({ queryKey: navCountsKeys.all })
    },
    meta: { errorMessage: "Не удалось отправить сообщение" },
  })
}

export const useMarkDirectReadMutation = (role: "buyer" | "supplier") => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => directChatsApi.markRead(role, id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: directChatKeys.detail(role, id) })
      void qc.invalidateQueries({ queryKey: directChatKeys.list(role) })
      void qc.invalidateQueries({ queryKey: navCountsKeys.all })
    },
    meta: { silent: true },
  })
}

export const upsertDirectChatInList = (
  current: DirectChatThread[] | undefined,
  thread: DirectChatThread,
): DirectChatThread[] => {
  if (!current) return [thread]
  if (current.some((item) => item.id === thread.id)) {
    return current.map((item) => (item.id === thread.id ? thread : item))
  }
  return [thread, ...current]
}
