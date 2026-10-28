import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type { ContractWithRelations, Message } from "@/types"
import { apiFetch } from "./client"

const PREFIX = "/buyer/contracts"

export const contractsApi = {
  list: (params: PageParams = {}) =>
    apiFetch<Page<ContractWithRelations>>(`${PREFIX}/${buildPageQuery(params)}`),

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
    return apiFetch<unknown>(`${PREFIX}/${id}/files`, {
      method: "POST",
      body: form,
    })
  },

  approveSubmission: (contractId: number, submissionId: number) =>
    apiFetch<unknown>(
      `${PREFIX}/${contractId}/submissions/${submissionId}/approve`,
      { method: "POST" },
    ),

  rejectSubmission: (contractId: number, submissionId: number) =>
    apiFetch<unknown>(
      `${PREFIX}/${contractId}/submissions/${submissionId}/reject`,
      { method: "POST" },
    ),

  uploadDisputeEvidence: (id: number, file: File, note?: string) => {
    const form = new FormData()
    form.append("file", file)
    if (note?.trim()) form.append("note", note.trim())
    return apiFetch<ContractWithRelations>(`${PREFIX}/${id}/dispute/evidence`, {
      method: "POST",
      body: form,
    })
  },

  openDispute: (id: number, reason: string) =>
    apiFetch<unknown>(`${PREFIX}/${id}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
}
