import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type {
  CatalogItemInput,
  CatalogItemWithRelations,
  ItemMediaType,
  ItemStatus,
} from "@/types"
import { apiFetch } from "../client"

const PREFIX = "/supplier/catalog/items"
const MEDIA_PREFIX = "/supplier/catalog/media"

export type CatalogMediaUpload = {
  file_name: string
  file_url: string
  media_type: ItemMediaType
}

export const supplierCatalogApi = {
  list: (status?: ItemStatus, params: PageParams = {}) =>
    apiFetch<Page<CatalogItemWithRelations>>(
      `${PREFIX}${buildPageQuery({ ...params, status })}`,
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

  uploadMedia: (file: File) => {
    const form = new FormData()
    form.append("file", file)
    return apiFetch<CatalogMediaUpload>(MEDIA_PREFIX, {
      method: "POST",
      body: form,
    })
  },
}
