import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  adminChatsApi,
  type AdminChatsListParams,
} from "@/lib/api/admin/chats"
import { isApiEnabled } from "@/lib/api/config"

export const adminChatsKeys = {
  all: ["admin", "chats"] as const,
  list: (params: AdminChatsListParams) =>
    [...adminChatsKeys.all, "list", params] as const,
  detail: (id: string | null) => [...adminChatsKeys.all, "detail", id ?? ""] as const,
}

export const useAdminChatsQuery = (params: AdminChatsListParams, enabled = true) =>
  useQuery({
    queryKey: adminChatsKeys.list(params),
    queryFn: () => adminChatsApi.list(params),
    enabled: enabled && isApiEnabled(),
  })

export const useAdminChatQuery = (chatId: string | null, enabled = true) =>
  useQuery({
    queryKey: adminChatsKeys.detail(chatId),
    queryFn: () => adminChatsApi.get(chatId!),
    enabled: enabled && isApiEnabled() && Boolean(chatId),
  })

export const useAdminSendChatMessageMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, text }: { chatId: string; text: string }) =>
      adminChatsApi.sendMessage(chatId, text),
    onSuccess: (detail) => {
      void qc.invalidateQueries({ queryKey: adminChatsKeys.all })
      qc.setQueryData(adminChatsKeys.detail(detail.id), detail)
    },
    meta: { successMessage: "Сообщение отправлено" },
  })
}

export const useAdminDeleteChatMessageMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, messageId }: { chatId: string; messageId: number }) =>
      adminChatsApi.deleteMessage(chatId, messageId),
    onSuccess: (detail) => {
      void qc.invalidateQueries({ queryKey: adminChatsKeys.all })
      qc.setQueryData(adminChatsKeys.detail(detail.id), detail)
    },
    meta: { successMessage: "Сообщение удалено" },
  })
}
