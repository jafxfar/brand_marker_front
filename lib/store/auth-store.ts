import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEMO_SUPPLIER_ACTOR_ID,
  DEMO_BUYER_ACTOR_IDS,
} from "@/lib/mock/companies"
import { authApi, type ActorSummary } from "@/lib/api/auth"
import { isApiEnabled } from "@/lib/api/config"
import { tokenStorage } from "@/lib/api/client"

export type SessionRole = "customer" | "supplier"

export type SessionUser = {
  id: string
  userId: number
  email: string
  name: string
  role: SessionRole
  actorId: number
  activeActorId: number | null
  actors: ActorSummary[]
  capabilities: { buyer: boolean; supplier: boolean }
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
  loginWithCredentials: (params: {
    email: string
    password: string
    role: SessionRole
  }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (patch: Partial<SessionUser>) => void
  switchActor: (actorId: number) => Promise<void>
  switchCompany: (companyId: number) => Promise<void>
  activateRole: (side: "buyer" | "supplier") => Promise<void>
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

const sideForRole = (role: SessionRole): "buyer" | "supplier" =>
  role === "supplier" ? "supplier" : "buyer"

const pickActorForRole = (
  actors: ActorSummary[],
  role: SessionRole,
  preferredId?: number | null,
): ActorSummary | undefined => {
  const side = sideForRole(role)
  const forSide = actors.filter((a) => a.side === side)
  if (preferredId) {
    const match = forSide.find((a) => a.id === preferredId)
    if (match) return match
  }
  return (
    forSide.find((a) => a.kind === "individual") ??
    forSide[0]
  )
}

const sessionFromMe = (
  me: Awaited<ReturnType<typeof authApi.me>>,
  role: SessionRole,
): SessionUser => {
  const active = pickActorForRole(me.actors, role, me.active_actor_id)
  const actorId = active?.id ?? 0
  const companyIds = me.companies.map((c) => c.id)
  const name = `${me.user.first_name} ${me.user.last_name}`.trim()

  if (active?.id) {
    tokenStorage.setActorId(active.id)
  }

  return {
    id: String(me.user.id),
    userId: me.user.id,
    email: me.user.email,
    name,
    role,
    actorId,
    activeActorId: active?.id ?? null,
    actors: me.actors,
    capabilities: me.capabilities,
    companyId: active?.company_id ?? actorId,
    companyIds,
    activeCompanyId: active?.company_id ?? me.active_company_id,
    company: active?.display_name,
    phone: me.user.phone ?? undefined,
  }
}

const migrateUser = (user: SessionUser): SessionUser => {
  const companyIds =
    user.companyIds?.length > 0
      ? user.companyIds
      : user.companyId
        ? [user.companyId]
        : []

  const activeCompanyId =
    user.activeCompanyId ?? user.companyId ?? companyIds[0] ?? null

  const actorId = user.activeActorId ?? user.actorId ?? activeCompanyId ?? 0

  return {
    ...user,
    userId: user.userId ?? 1,
    companyIds,
    activeCompanyId,
    actorId,
    activeActorId: user.activeActorId ?? actorId,
    actors: user.actors ?? [],
    capabilities: user.capabilities ?? {
      buyer: user.role === "customer",
      supplier: user.role === "supplier",
    },
    companyId: activeCompanyId ?? actorId,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      nextUserId: 100,

      login: ({ email, role, name }) => {
        if (isApiEnabled()) return
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
            activeActorId: activeId,
            actors: [],
            capabilities: {
              buyer: !isSupplier,
              supplier: isSupplier,
            },
            companyId: activeId,
            companyIds,
            activeCompanyId: activeId,
            company: isSupplier ? "ТехноСнаб" : undefined,
            hasDelivery: false,
            city: "Душанбе",
          }),
        }))
      },

      loginWithCredentials: async ({ email, password, role }) => {
        await authApi.login(email, password)
        const me = await authApi.me()
        const active = pickActorForRole(me.actors, role, me.active_actor_id)
        if (!active) {
          const sideLabel = role === "customer" ? "заказчика" : "поставщика"
          throw new Error(
            `Нет профиля ${sideLabel}. Активируйте роль в настройках или создайте компанию.`,
          )
        }
        set({
          isAuthenticated: true,
          user: sessionFromMe(me, role),
        })
      },

      logout: async () => {
        if (isApiEnabled()) {
          await authApi.logout()
        }
        set({ user: null, isAuthenticated: false })
      },

      updateProfile: (patch) =>
        set((state) =>
          state.user ? { user: migrateUser({ ...state.user, ...patch }) } : state,
        ),

      switchActor: async (actorId) => {
        if (isApiEnabled()) {
          const me = await authApi.switchActor(actorId)
          const role = get().user?.role ?? "customer"
          set({ user: sessionFromMe(me, role) })
          return
        }
        set((state) => {
          if (!state.user) return state
          const actor = state.user.actors.find((a) => a.id === actorId)
          return {
            user: {
              ...state.user,
              actorId,
              activeActorId: actorId,
              activeCompanyId: actor?.company_id ?? state.user.activeCompanyId,
              companyId: actor?.company_id ?? actorId,
              company: actor?.display_name ?? state.user.company,
            },
          }
        })
      },

      switchCompany: async (companyId) => {
        if (isApiEnabled()) {
          const me = await authApi.switchCompany(companyId)
          const role = get().user?.role ?? "customer"
          set({ user: sessionFromMe(me, role) })
          return
        }
        set((state) => {
          if (!state.user) return state
          if (!state.user.companyIds.includes(companyId)) return state
          return {
            user: {
              ...state.user,
              activeCompanyId: companyId,
              actorId: companyId,
              activeActorId: companyId,
              companyId,
            },
          }
        })
      },

      activateRole: async (side) => {
        if (!isApiEnabled()) return
        const me = await authApi.activateRole(side)
        const role: SessionRole = side === "supplier" ? "supplier" : "customer"
        set({
          isAuthenticated: true,
          user: sessionFromMe(me, role),
        })
      },

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
              activeActorId: setActive ? actorId : state.user.activeActorId,
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
