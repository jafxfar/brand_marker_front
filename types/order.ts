export const ORDER_KINDS = ["product", "service"] as const

export type OrderKind = (typeof ORDER_KINDS)[number]

export const ORDER_STATUSES = [
  "published",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_SCHEMES = ["full", "half", "milestone"] as const

export type PaymentScheme = (typeof PAYMENT_SCHEMES)[number]

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

export type Offer = {
  id: string
  orderId: string
  supplierId: number
  supplierActorId?: number
  supplierName?: string
  price: number
  message?: string
  deliveryDays?: number
  status: string
  createdAt: string
}

export type Order = {
  id: string
  kind: OrderKind
  title: string
  description: string
  categoryId?: string
  category?: string
  budget: number
  qty: number
  needsDelivery: boolean
  customerId?: string
  customerName?: string
  customerCity?: string
  buyerActorId?: number
  status: OrderStatus
  offers: Offer[]
  acceptedOfferId?: string
  createdAt: string | number
}

export type MarketplaceOrder = {
  id: string
  buyer_actor_id: number
  kind: OrderKind
  title: string
  description: string
  category_id: number | null
  category_label: string | null
  budget: number
  qty: number
  needs_delivery: boolean
  status: OrderStatus
  accepted_offer_id: string | null
  created_at: string
  offers: Array<{
    id: string
    order_id: string
    supplier_actor_id: number
    supplier_name: string | null
    price: number
    message: string | null
    delivery_days: number | null
    status: string
    created_at: string
  }>
}

export type CustomerGroup = {
  buyer_actor_id: number
  buyer_name: string
  order_count: number
  total_budget: number
}

export const apiOrderToLocal = (order: MarketplaceOrder): Order => ({
  id: order.id,
  kind: order.kind,
  title: order.title,
  description: order.description,
  categoryId: order.category_id ? String(order.category_id) : undefined,
  category: order.category_label ?? undefined,
  budget: order.budget,
  qty: order.qty,
  needsDelivery: order.needs_delivery,
  buyerActorId: order.buyer_actor_id,
  status: order.status,
  acceptedOfferId: order.accepted_offer_id ?? undefined,
  createdAt: order.created_at,
  offers: order.offers.map((o) => ({
    id: o.id,
    orderId: o.order_id,
    supplierId: o.supplier_actor_id,
    supplierActorId: o.supplier_actor_id,
    supplierName: o.supplier_name ?? undefined,
    price: o.price,
    message: o.message ?? undefined,
    deliveryDays: o.delivery_days ?? undefined,
    status: o.status,
    createdAt: o.created_at,
  })),
})
