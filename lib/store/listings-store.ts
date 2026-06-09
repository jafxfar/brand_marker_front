import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Listing } from "@/types"

export type ListingInput = Omit<Listing, "id" | "supplierId">

interface ListingsState {
  items: Listing[]
  add: (supplierId: string, input: ListingInput) => Listing
  update: (id: string, patch: Partial<ListingInput>) => void
  remove: (id: string) => void
  getById: (id: string) => Listing | undefined
  bySupplier: (supplierId: string) => Listing[]
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (supplierId, input) => {
        const listing: Listing = { ...input, id: uid(), supplierId }
        set((state) => ({ items: [listing, ...state.items] }))
        return listing
      },
      update: (id, patch) =>
        set((state) => ({
          items: state.items.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((l) => l.id !== id) })),
      getById: (id) => get().items.find((l) => l.id === id),
      bySupplier: (supplierId) => get().items.filter((l) => l.supplierId === supplierId),
    }),
    { name: "bm-listings" },
  ),
)
