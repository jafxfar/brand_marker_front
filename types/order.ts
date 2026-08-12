export const ORDER_KINDS = ["product", "service"] as const

export type OrderKind = (typeof ORDER_KINDS)[number]

export const PAYMENT_SCHEMES = ["prepay", "half", "postpay"] as const

export type PaymentScheme = (typeof PAYMENT_SCHEMES)[number]

export type EscrowStatus = "none" | "held" | "released" | "disputed" | "refunded"

export type CartItem = {
  listingId: string
  title: string
  price: number
  qty: number
  kind: OrderKind
  supplierId: number
  color?: string
  sku?: string
  categoryId?: string
  categoryLabel?: string
}
