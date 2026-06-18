import type { MarketplaceOrder } from "@/types/order"
import { apiFetch } from "../client"

const PREFIX = "/buyer/orders"

export type CreateBuyerOrderPayload = {
  kind: "product" | "service"
  title: string
  description?: string
  category_id?: number | null
  category_label?: string | null
  budget: number
  qty?: number
  needs_delivery?: boolean
}

export const buyerOrdersApi = {
  list: () => apiFetch<MarketplaceOrder[]>(PREFIX),

  get: (id: string) => apiFetch<MarketplaceOrder>(`${PREFIX}/${id}`),

  create: (data: CreateBuyerOrderPayload) =>
    apiFetch<MarketplaceOrder>(PREFIX, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    apiFetch<MarketplaceOrder>(`${PREFIX}/${id}/cancel`, { method: "POST" }),

  acceptOffer: (orderId: string, offerId: string) =>
    apiFetch<MarketplaceOrder>(`${PREFIX}/${orderId}/offers/${offerId}/accept`, {
      method: "POST",
    }),
}
