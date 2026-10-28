import { apiFetch } from "../client"

export type SubscriptionResponse = {
  plan: string
  active_until: string | null
  is_active: boolean
}

export type SubscriptionPaymentMethod = {
  id: "alif" | "dc" | "eskhata"
  label: string
  supported: boolean
  hint: string
}

export type SubscriptionPaymentConfig = {
  provider: "alif" | "mock"
  currency: string
  methods: SubscriptionPaymentMethod[]
}

export type SubscriptionCheckoutResponse = {
  plan: string
  active_until: string | null
  is_active: boolean
  payment_status: string
  order_id: string | null
  payment_url: string | null
  gateway: string
  message: string | null
}

export type SubscriptionOrderSyncResponse = {
  order_id: string
  payment_status: string
  plan: string | null
  is_active: boolean
  active_until: string | null
}

export type SubscriptionPaymentMethodId = "alif" | "dc" | "eskhata"

export const supplierSubscriptionApi = {
  get: () => apiFetch<SubscriptionResponse>("/supplier/subscription"),

  paymentConfig: () =>
    apiFetch<SubscriptionPaymentConfig>("/supplier/subscription/payments/config"),

  checkout: (plan: string, method: SubscriptionPaymentMethodId = "alif") =>
    apiFetch<SubscriptionCheckoutResponse>("/supplier/subscription/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, method }),
    }),

  activate: (plan: string, method: SubscriptionPaymentMethodId = "alif") =>
    apiFetch<SubscriptionCheckoutResponse>("/supplier/subscription/activate", {
      method: "POST",
      body: JSON.stringify({ plan, method }),
    }),

  syncAlifOrder: (orderId: string) =>
    apiFetch<SubscriptionOrderSyncResponse>(
      `/supplier/subscription/alif/orders/${encodeURIComponent(orderId)}/sync`,
      { method: "POST" },
    ),

  cancel: () =>
    apiFetch<SubscriptionCheckoutResponse>("/supplier/subscription/cancel", {
      method: "POST",
    }),
}
