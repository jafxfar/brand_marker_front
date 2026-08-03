import type { CatalogReportReason } from "@/types"
import { apiFetch } from "./client"

export type CatalogItemReportResponse = {
  id: number
  item_id: number
  reason: CatalogReportReason
  details: string | null
  status: "open" | "resolved" | "dismissed"
  created_at: string
}

export const catalogApi = {
  reportItem: (
    itemId: number,
    payload: { reason: CatalogReportReason; details?: string },
  ) =>
    apiFetch<CatalogItemReportResponse>(`/catalog/items/${itemId}/reports`, {
      method: "POST",
      body: JSON.stringify({
        reason: payload.reason,
        details: payload.details?.trim() || null,
      }),
    }),
}
