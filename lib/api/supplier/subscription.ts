import { apiFetch } from "../client"

export type SubscriptionResponse = {
  plan: string
  active_until: string | null
  is_active: boolean
}

export const supplierSubscriptionApi = {
  get: () => apiFetch<SubscriptionResponse>("/supplier/subscription"),

  activate: (plan: string) =>
    apiFetch<SubscriptionResponse>("/supplier/subscription/activate", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  cancel: () =>
    apiFetch<SubscriptionResponse>("/supplier/subscription/cancel", {
      method: "POST",
    }),
}
