import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEMO_SUPPLIER_ACTOR_ID } from "@/lib/mock/companies"

export type SessionRole = "customer" | "supplier"

export type SessionUser = {
  id: string
  email: string
  name: string
  role: SessionRole
  actorId: number
  companyId: number
  hasDelivery?: boolean
  city?: string
  phone?: string
  company?: string
}

interface AuthState {
  user: SessionUser | null
  isAuthenticated: boolean
  login: (params: { email: string; role: SessionRole; name?: string }) => void
  logout: () => void
  updateProfile: (patch: Partial<SessionUser>) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const nameFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? "Пользователь"
  return local.charAt(0).toUpperCase() + local.slice(1)
}

const DEMO_CUSTOMER_ACTOR_ID = 201

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: ({ email, role, name }) => {
        const isSupplier = role === "supplier"
        set({
          isAuthenticated: true,
          user: {
            id: uid(),
            email,
            name: name?.trim() || nameFromEmail(email),
            role,
            actorId: isSupplier ? DEMO_SUPPLIER_ACTOR_ID : DEMO_CUSTOMER_ACTOR_ID,
            companyId: isSupplier ? DEMO_SUPPLIER_ACTOR_ID : DEMO_CUSTOMER_ACTOR_ID,
            company: isSupplier ? "ТехноСнаб" : undefined,
            hasDelivery: false,
            city: "Душанбе",
          },
        })
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (patch) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...patch } } : state,
        ),
    }),
    { name: "bm-auth" },
  ),
)
