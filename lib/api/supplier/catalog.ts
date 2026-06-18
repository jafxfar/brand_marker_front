import type { CatalogItemInput, CatalogItemWithRelations, ItemStatus } from "@/types"
import { apiFetch } from "../client"

const PREFIX = "/supplier/catalog/items"

export const supplierCatalogApi = {
  list: (status?: ItemStatus) =>
    apiFetch<CatalogItemWithRelations[]>(
      `${PREFIX}${status ? `?status=${status}` : ""}`,
    ),

  get: (id: number) => apiFetch<CatalogItemWithRelations>(`${PREFIX}/${id}`),

  create: (data: CatalogItemInput) =>
    apiFetch<CatalogItemWithRelations>(PREFIX, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CatalogItemInput) =>
    apiFetch<CatalogItemWithRelations>(`${PREFIX}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  publish: (id: number) =>
    apiFetch<CatalogItemWithRelations>(`${PREFIX}/${id}/publish`, { method: "POST" }),

  archive: (id: number) =>
    apiFetch<CatalogItemWithRelations>(`${PREFIX}/${id}/archive`, { method: "POST" }),

  delete: (id: number) =>
    apiFetch<void>(`${PREFIX}/${id}`, { method: "DELETE" }),
}
