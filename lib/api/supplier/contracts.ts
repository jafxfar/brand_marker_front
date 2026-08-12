import type { ContractWithRelations, Message } from "@/types"
import { apiFetch } from "../client"

const PREFIX = "/supplier/contracts"

export const supplierContractsApi = {
  list: () => apiFetch<ContractWithRelations[]>(`${PREFIX}/`),

  get: (id: number) => apiFetch<ContractWithRelations>(`${PREFIX}/${id}`),

  sendMessage: (id: number, text: string) =>
    apiFetch<ContractWithRelations>(`${PREFIX}/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  markMessageDelivered: (contractId: number, messageId: number) =>
    apiFetch<Message>(`${PREFIX}/${contractId}/messages/${messageId}/delivered`, {
      method: "POST",
    }),

  markMessagesRead: (contractId: number) =>
    apiFetch<{ message_ids: number[]; messages?: Message[] }>(
      `${PREFIX}/${contractId}/messages/read`,
      { method: "POST" },
    ),

  uploadFile: (id: number, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiFetch<ContractWithRelations>(`${PREFIX}/${id}/files`, {
      method: "POST",
      body: form,
    })
  },

  submitWork: (
    id: number,
    data: {
      type?: string
      note: string
      file_names: string[]
      assets?: {
        kind: string
        name: string
        url: string
        file_type?: string | null
      }[]
    },
  ) =>
    apiFetch<unknown>(`${PREFIX}/${id}/submissions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  openDispute: (id: number, reason: string) =>
    apiFetch<unknown>(`${PREFIX}/${id}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
}
