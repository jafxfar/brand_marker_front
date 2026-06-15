import type { ContractWithRelations } from "@/types"
import { apiFetch } from "./client"

const PREFIX = "/buyer/contracts"

export const contractsApi = {
  list: () => apiFetch<ContractWithRelations[]>(`${PREFIX}/`),

  get: (id: number) => apiFetch<ContractWithRelations>(`${PREFIX}/${id}`),

  sendMessage: (id: number, text: string) =>
    apiFetch<unknown>(`${PREFIX}/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

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

  openDispute: (contractId: number, reason: string) =>
    apiFetch<unknown>(`${PREFIX}/${contractId}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
}
