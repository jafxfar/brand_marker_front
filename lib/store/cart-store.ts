import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/types"

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, "qty">, qty?: number) => void
  setQty: (listingId: string, qty: number) => void
  remove: (listingId: string) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.listingId === item.listingId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.listingId === item.listingId ? { ...i, qty: i.qty + qty } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, qty }] }
        }),
      setQty: (listingId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.listingId === listingId ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      remove: (listingId) =>
        set((state) => ({ items: state.items.filter((i) => i.listingId !== listingId) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "bm-cart" },
  ),
)
