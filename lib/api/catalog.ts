import type { CatalogReportReason, Currency } from "@/types"
import { apiFetch } from "./client"

export type CatalogItemReportResponse = {
  id: number
  item_id: number
  reason: CatalogReportReason
  details: string | null
  status: "open" | "resolved" | "dismissed"
  created_at: string
}

export type CatalogOfferKind = "buy" | "negotiate"

export type CatalogOfferCreate = {
  kind: CatalogOfferKind
  price?: number
  message?: string
}

export type CatalogOfferResponse = {
  rfq_id: string
  proposal_id: number
  kind: CatalogOfferKind
  price: number
  currency: Currency | string
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

  createOffer: (itemId: number, payload: CatalogOfferCreate) =>
    apiFetch<CatalogOfferResponse>(`/buyer/catalog/items/${itemId}/offers`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
}
