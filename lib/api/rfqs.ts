import type { RfqCreate, RfqUpdate, RfqWithRelations } from "@/types"
import { apiFetch } from "./client"
import { toRfqPayload } from "./rfq-payload"

const PREFIX = "/buyer/rfqs"

export const rfqsApi = {
  list: (tab?: string) =>
    apiFetch<RfqWithRelations[]>(`${PREFIX}${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`),

  get: (id: string) => apiFetch<RfqWithRelations>(`${PREFIX}/${id}`),

  create: (data: RfqCreate) =>
    apiFetch<RfqWithRelations>(`${PREFIX}/`, {
      method: "POST",
      body: JSON.stringify(toRfqPayload(data)),
    }),

  update: (id: string, data: RfqUpdate) =>
    apiFetch<RfqWithRelations>(`${PREFIX}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  publish: (id: string) =>
    apiFetch<RfqWithRelations>(`${PREFIX}/${id}/publish`, { method: "POST" }),

  close: (id: string) =>
    apiFetch<RfqWithRelations>(`${PREFIX}/${id}/close`, { method: "POST" }),

  invite: (id: string, supplierIds: number[]) =>
    apiFetch<RfqWithRelations>(`${PREFIX}/${id}/invite`, {
      method: "POST",
      body: JSON.stringify({ supplier_ids: supplierIds }),
    }),

  uploadAttachment: (id: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiFetch<RfqWithRelations>(`${PREFIX}/${id}/attachments`, {
      method: "POST",
      body: form,
    })
  },

  deleteAttachment: (id: string, attachmentId: string) =>
    apiFetch<RfqWithRelations>(`${PREFIX}/${id}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
}
