import type { CustomerGroup, MarketplaceOrder } from "@/types/order"
import { apiFetch } from "../client"

const PREFIX = "/supplier/orders"

export const supplierOrdersApi = {
  list: (tab: "available" | "responded" | "deals") =>
    apiFetch<MarketplaceOrder[]>(`${PREFIX}?tab=${tab}`),

  get: (id: string) => apiFetch<MarketplaceOrder>(`${PREFIX}/${id}`),

  submitOffer: (
    orderId: string,
    data: { price: number; message?: string; delivery_days?: number },
  ) =>
    apiFetch<MarketplaceOrder>(`${PREFIX}/${orderId}/offers`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  customers: () => apiFetch<CustomerGroup[]>(`${PREFIX}/customers`),
}
