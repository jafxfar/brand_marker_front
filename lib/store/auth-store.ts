import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEMO_SUPPLIER_ACTOR_ID,
  DEMO_BUYER_ACTOR_IDS,
} from "@/lib/mock/companies"

export type SessionRole = "customer" | "supplier"

export type SessionUser = {
  id: string
  userId: number
  email: string
  name: string
  role: SessionRole
  actorId: number
  companyId: number
  companyIds: number[]
  activeCompanyId: number | null
  hasDelivery?: boolean
  city?: string
  phone?: string
  company?: string
}

interface AuthState {
  user: SessionUser | null
  isAuthenticated: boolean
  nextUserId: number
  login: (params: { email: string; role: SessionRole; name?: string }) => void
  logout: () => void
  updateProfile: (patch: Partial<SessionUser>) => void
  switchCompany: (companyId: number) => void
  linkCompany: (companyId: number, options?: { setActive?: boolean; title?: string }) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const nameFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? "Пользователь"
  return local.charAt(0).toUpperCase() + local.slice(1)
}

const DEMO_CUSTOMER_ACTOR_ID = DEMO_BUYER_ACTOR_IDS[0]

const demoCompanyIdForRole = (role: SessionRole): number =>
  role === "supplier" ? DEMO_SUPPLIER_ACTOR_ID : DEMO_CUSTOMER_ACTOR_ID

const migrateUser = (user: SessionUser): SessionUser => {
  const companyIds =
    user.companyIds?.length > 0
      ? user.companyIds
      : user.companyId
        ? [user.companyId]
        : []

  const activeCompanyId =
    user.activeCompanyId ?? user.companyId ?? companyIds[0] ?? null

  const actorId = activeCompanyId ?? user.actorId

  return {
    ...user,
    userId: user.userId ?? 1,
    companyIds,
    activeCompanyId,
    actorId,
    companyId: actorId,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      nextUserId: 100,

      login: ({ email, role, name }) => {
        const isSupplier = role === "supplier"
        const existing = get().user
        const userId = existing?.email === email ? existing.userId : get().nextUserId
        const companyIds =
          existing?.email === email && existing.companyIds.length > 0
            ? existing.companyIds
            : [demoCompanyIdForRole(role)]

        const activeId = companyIds[0] ?? demoCompanyIdForRole(role)

        set((state) => ({
          nextUserId:
            existing?.email === email ? state.nextUserId : state.nextUserId + 1,
          isAuthenticated: true,
          user: migrateUser({
            id: existing?.email === email ? existing.id : uid(),
            userId,
            email,
            name: name?.trim() || nameFromEmail(email),
            role,
            actorId: activeId,
            companyId: activeId,
            companyIds,
            activeCompanyId: activeId,
            company: isSupplier ? "ТехноСнаб" : undefined,
            hasDelivery: false,
            city: "Душанбе",
          }),
        }))
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (patch) =>
        set((state) =>
          state.user ? { user: migrateUser({ ...state.user, ...patch }) } : state,
        ),

      switchCompany: (companyId) =>
        set((state) => {
          if (!state.user) return state
          if (!state.user.companyIds.includes(companyId)) return state
          return {
            user: {
              ...state.user,
              activeCompanyId: companyId,
              actorId: companyId,
              companyId,
            },
          }
        }),

      linkCompany: (companyId, options) =>
        set((state) => {
          if (!state.user) return state
          const companyIds = state.user.companyIds.includes(companyId)
            ? state.user.companyIds
            : [...state.user.companyIds, companyId]

          const setActive = options?.setActive ?? true
          const activeCompanyId = setActive ? companyId : state.user.activeCompanyId
          const actorId = setActive ? companyId : state.user.actorId

          return {
            user: {
              ...state.user,
              companyIds,
              activeCompanyId: setActive ? companyId : state.user.activeCompanyId,
              actorId,
              companyId: actorId,
              company: options?.title ?? state.user.company,
            },
          }
        }),
    }),
    {
      name: "bm-auth",
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<AuthState>) }
        if (merged.user) {
          merged.user = migrateUser(merged.user)
        }
        return merged
      },
    },
  ),
)
