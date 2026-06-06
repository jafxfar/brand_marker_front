import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Offer, Order, OrderKind, PaymentScheme } from "@/types"
import { generateOffers } from "@/lib/mock/offers"
import { useAuthStore } from "@/lib/store/auth-store"

interface CreateOrderInput {
  kind: OrderKind
  title: string
  description: string
  categoryId: string
  category: string
  budget: number
  qty: number
  needsDelivery: boolean
  color?: string
  sku?: string
  preferredScheme?: PaymentScheme
}

interface OrdersState {
  orders: Order[]
  createOrder: (input: CreateOrderInput) => Order
  addOffer: (orderId: string, offer: Omit<Offer, "id" | "orderId" | "createdAt">) => void
  acceptOffer: (orderId: string, offerId: string) => void
  pay: (orderId: string, scheme: PaymentScheme, amount: number) => void
  releasePayment: (orderId: string) => void
  openDispute: (orderId: string, reason: string) => void
  resolveDispute: (orderId: string, refund: boolean) => void
  leaveReview: (orderId: string, rating: number, text: string) => void
  cancelOrder: (orderId: string) => void
  getOrder: (orderId: string) => Order | undefined
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (input) => {
        const id = uid()
        const offers = generateOffers(id, input.categoryId, input.budget)
        const customer = useAuthStore.getState().user
        const order: Order = {
          id,
          ...input,
          customerId: customer?.id,
          customerName: customer?.company?.trim() || customer?.name,
          customerCity: customer?.city,
          status: "published",
          offers,
          createdAt: Date.now(),
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },

      addOffer: (orderId, offer) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o
            // Prevent duplicate offers from the same supplier.
            if (o.offers.some((x) => x.supplierId === offer.supplierId)) return o
            const fullOffer: Offer = {
              ...offer,
              id: uid(),
              orderId,
              createdAt: Date.now(),
            }
            return { ...o, offers: [fullOffer, ...o.offers] }
          }),
        })),

      acceptOffer: (orderId, offerId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, acceptedOfferId: offerId, status: "in_progress" }
              : o,
          ),
        })),

      pay: (orderId, scheme, amount) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "in_progress",
                  payment: {
                    scheme,
                    amount,
                    escrow: "held",
                    releasedAmount: scheme === "half" ? Math.round(amount / 2) : 0,
                    paidAt: Date.now(),
                  },
                }
              : o,
          ),
        })),

      releasePayment: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.payment
              ? {
                  ...o,
                  status: "completed",
                  payment: {
                    ...o.payment,
                    escrow: "released",
                    releasedAmount: o.payment.amount,
                  },
                }
              : o,
          ),
        })),

      openDispute: (orderId, reason) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "disputed",
                  dispute: { reason, createdAt: Date.now() },
                  payment: o.payment ? { ...o.payment, escrow: "disputed" } : o.payment,
                }
              : o,
          ),
        })),

      resolveDispute: (orderId, refund) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.payment
              ? {
                  ...o,
                  status: refund ? "cancelled" : "completed",
                  payment: {
                    ...o.payment,
                    escrow: refund ? "refunded" : "released",
                    releasedAmount: refund ? 0 : o.payment.amount,
                  },
                }
              : o,
          ),
        })),

      leaveReview: (orderId, rating, text) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, review: { rating, text, createdAt: Date.now() } }
              : o,
          ),
        })),

      cancelOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o,
          ),
        })),

      getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
    }),
    { name: "bm-orders" },
  ),
)
