import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  CatalogItemInput,
  CatalogItemWithRelations,
  ItemStatus,
} from "@/types"
import { mockCatalogItems } from "@/lib/mock/items"
import { getCatalogCategory } from "@/lib/mock/catalog-categories"
import { API_MODE } from "@/lib/api/config"

interface ItemsState {
  items: CatalogItemWithRelations[]
  getItemsBySupplier: (actorId: number) => CatalogItemWithRelations[]
  getItemsByStatus: (actorId: number, status?: ItemStatus) => CatalogItemWithRelations[]
  getItem: (id: number) => CatalogItemWithRelations | undefined
  createItem: (actorId: number, input: CatalogItemInput) => CatalogItemWithRelations
  updateItem: (id: number, input: CatalogItemInput) => CatalogItemWithRelations | undefined
  archiveItem: (id: number) => void
  publishItem: (id: number) => void
}

const nextId = (items: CatalogItemWithRelations[]): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1

const buildItem = (
  id: number,
  actorId: number,
  input: CatalogItemInput,
  createdAt?: string,
): CatalogItemWithRelations => {
  const category = getCatalogCategory(input.category_id)
  return {
    id,
    actor_id: actorId,
    type: input.type,
    category_id: input.category_id,
    title: input.title,
    description: input.description,
    status: input.status,
    created_at: createdAt ?? new Date().toISOString(),
    category,
    attributes: input.attributes.map((attr, index) => ({
      id: id * 100 + index + 1,
      item_id: id,
      name: attr.name,
      value: attr.value,
      value_type: attr.value_type,
      sort_order: attr.sort_order ?? index,
    })),
    pricing: {
      id: id * 10 + 1,
      item_id: id,
      ...input.pricing,
    },
    media: input.media.map((m, index) => ({
      id: id * 1000 + index + 1,
      item_id: id,
      file_name: m.file_name,
      file_url: m.file_url,
      media_type: m.media_type,
      sort_order: m.sort_order ?? index,
    })),
    stats: { item_id: id, views: 0, leads: 0 },
  }
}

export const useItemsStore = create<ItemsState>()(
  persist(
    (set, get) => ({
      items: API_MODE ? [] : mockCatalogItems,

      getItemsBySupplier: (actorId) =>
        get()
          .items.filter((item) => item.actor_id === actorId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),

      getItemsByStatus: (actorId, status) => {
        const items = get().getItemsBySupplier(actorId)
        if (!status) return items
        return items.filter((item) => item.status === status)
      },

      getItem: (id) => get().items.find((item) => item.id === id),

      createItem: (actorId, input) => {
        const id = nextId(get().items)
        const item = buildItem(id, actorId, input)
        set((state) => ({ items: [item, ...state.items] }))
        return item
      },

      updateItem: (id, input) => {
        const existing = get().getItem(id)
        if (!existing) return undefined
        const updated = buildItem(id, existing.actor_id, input, existing.created_at)
        const stats = existing.stats ?? { item_id: id, views: 0, leads: 0 }
        const item: CatalogItemWithRelations = { ...updated, stats }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? item : i)),
        }))
        return item
      },

      archiveItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, status: "archived" as const } : item,
          ),
        })),

      publishItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, status: "pending_review" as const } : item,
          ),
        })),
    }),
    {
      name: "bm-catalog-items",
      merge: (persisted, current) => {
        if (API_MODE) return current
        return { ...current, ...(persisted as Partial<ItemsState>) }
      },
    },
  ),
)
