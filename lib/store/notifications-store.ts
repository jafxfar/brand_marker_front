import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Notification } from "@/types"

interface NotificationsState {
  items: Notification[]
  add: (n: Omit<Notification, "id" | "read" | "createdAt">) => void
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clear: () => void
  unreadCount: () => number
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (n) =>
        set((state) => ({
          items: [
            { ...n, id: uid(), read: false, createdAt: Date.now() },
            ...state.items,
          ],
        })),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
        })),
      markAllRead: () =>
        set((state) => ({ items: state.items.map((i) => ({ ...i, read: true })) })),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      unreadCount: () => get().items.filter((i) => !i.read).length,
    }),
    { name: "bm-notifications" },
  ),
)
