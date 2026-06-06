// Domain models for the БрендМаркет marketplace prototype.
// All data is mock/local; no backend. Designed to be reusable for the
// supplier cabinet (Phase 2).

export type Role = "customer" | "supplier"

export type OrderKind = "product" | "service"

/**
 * Payment scheme chosen by the customer.
 * - prepay: 100% upfront, held in escrow until work accepted
 * - half: 50% upfront / 50% on completion
 * - postpay: paid after completion (NOT available for products)
 */
export type PaymentScheme = "prepay" | "half" | "postpay"

/** Escrow lifecycle for a paid order. */
export type EscrowStatus = "none" | "held" | "released" | "disputed" | "refunded"

export type OrderStatus =
  | "draft"
  | "published"
  | "in_progress"
  | "completed"
  | "disputed"
  | "cancelled"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  /** Whether the customer offers their own delivery. */
  hasDelivery: boolean
  phone?: string
  city?: string
  company?: string
}

export interface Category {
  id: string
  label: string
  /** lucide-react icon name reference is resolved in UI via a map. */
  icon: string
  count?: string
}

export interface Supplier {
  id: string
  name: string
  initials: string
  color: string
  categoryId: string
  category: string
  city: string
  rating: number
  reviews: number
  clients: string
  years: string
  verified: boolean
  hasDelivery: boolean
  specialties: string[]
}

/** A concrete offering of a supplier — either a product or a service. */
export interface Listing {
  id: string
  supplierId: string
  kind: OrderKind
  title: string
  description: string
  categoryId: string
  price: number
  /** Product-only attributes. */
  color?: string
  sku?: string
  inStock?: number
}

export interface CartItem {
  listingId: string
  supplierId: string
  title: string
  kind: OrderKind
  price: number
  qty: number
  color?: string
  sku?: string
}

/** Supplier response to a published order. */
export interface Offer {
  id: string
  orderId: string
  supplierId: string
  supplierName: string
  supplierInitials: string
  supplierColor: string
  rating: number
  reviews: number
  price: number
  message: string
  daysToComplete: number
  verified: boolean
  /** Boosted via an active promotion subscription. */
  promoted?: boolean
  createdAt: number
}

export interface Dispute {
  reason: string
  createdAt: number
}

export interface Review {
  rating: number
  text: string
  createdAt: number
}

export interface Payment {
  scheme: PaymentScheme
  amount: number
  escrow: EscrowStatus
  /** Amount already released to the supplier (for half scheme tracking). */
  releasedAmount: number
  paidAt: number
}

export interface Order {
  id: string
  kind: OrderKind
  title: string
  description: string
  categoryId: string
  category: string
  budget: number
  qty: number
  needsDelivery: boolean
  // Customer who created the order (captured at creation from auth).
  customerId?: string
  customerName?: string
  customerCity?: string
  // Product-only attributes
  color?: string
  sku?: string
  // Service payment scheme picked at creation
  preferredScheme?: PaymentScheme
  status: OrderStatus
  offers: Offer[]
  /** Selected supplier offer id. */
  acceptedOfferId?: string
  payment?: Payment
  dispute?: Dispute
  review?: Review
  createdAt: number
}

export interface Notification {
  id: string
  title: string
  body: string
  type: "order" | "offer" | "payment" | "system"
  read: boolean
  href?: string
  createdAt: number
}
