import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  DEMO_SUPPLIER_ACTOR_ID,
  DEMO_BUYER_ACTOR_IDS,
} from "@/lib/mock/companies"
import { authApi, type ActorSummary } from "@/lib/api/auth"
import { isApiEnabled } from "@/lib/api/config"
import { tokenStorage } from "@/lib/api/client"

export type SessionRole = "customer" | "supplier" | "admin"
export type MarketplaceSessionRole = Exclude<SessionRole, "admin">
export type AdminPlatformRole = "admin" | "superadmin" | "moderator"

export type SessionUser = {
  id: string
  userId: number
  email: string
  name: string
  role: SessionRole
  platformRole: string
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
  isReady: boolean
  nextUserId: number
  login: (params: { email: string; role: MarketplaceSessionRole; name?: string }) => void
  loginWithCredentials: (params: {
    email: string
    password: string
    role: MarketplaceSessionRole
  }) => Promise<SessionRole>
  loginAdminWithCredentials: (params: {
    email: string
    password: string
  }) => Promise<void>
  registerWithCredentials: (params: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
    role: MarketplaceSessionRole
  }) => Promise<void>
  restoreSession: (role: MarketplaceSessionRole) => Promise<boolean>
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

const demoCompanyIdForRole = (role: MarketplaceSessionRole): number =>
  role === "supplier" ? DEMO_SUPPLIER_ACTOR_ID : DEMO_CUSTOMER_ACTOR_ID

const sideForRole = (role: MarketplaceSessionRole): "buyer" | "supplier" =>
  role === "supplier" ? "supplier" : "buyer"

const pickActorForRole = (
  actors: ActorSummary[],
  role: MarketplaceSessionRole,
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
  if (role === "admin") {
    return {
      id: String(me.user.id),
      userId: me.user.id,
      email: me.user.email,
      name: `${me.user.first_name} ${me.user.last_name}`.trim() || me.user.email,
      role,
      platformRole: me.user.role,
      actorId: 0,
      activeActorId: null,
      actors: me.actors,
      capabilities: me.capabilities,
      companyId: 0,
      companyIds: [],
      activeCompanyId: null,
      phone: me.user.phone ?? undefined,
    }
  }

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
    platformRole: me.user.role,
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
    platformRole:
      user.platformRole ?? (user.role === "customer" ? "buyer" : user.role),
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
      isReady: false,
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
            platformRole: isSupplier ? "supplier" : "buyer",
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
        let me = await authApi.me()
        if (["admin", "superadmin", "moderator"].includes(me.user.role)) {
          set({
            isAuthenticated: true,
            isReady: true,
            user: sessionFromMe(me, "admin"),
          })
          return "admin"
        }
        let active = pickActorForRole(me.actors, role, me.active_actor_id)
        if (!active) {
          try {
            me = await authApi.activateRole(sideForRole(role))
            active = pickActorForRole(me.actors, role, me.active_actor_id)
          } catch {
            // fall through to explicit error below
          }
        }
        if (!active) {
          const sideLabel = role === "customer" ? "заказчика" : "поставщика"
          throw new Error(
            `Нет профиля ${sideLabel}. Активируйте роль в настройках или создайте компанию.`,
          )
        }
        set({
          isAuthenticated: true,
          isReady: true,
          user: sessionFromMe(me, role),
        })
        return role
      },

      loginAdminWithCredentials: async ({ email, password }) => {
        if (!isApiEnabled()) {
          throw new Error("Для входа администратора необходимо подключение к API")
        }
        await authApi.login(email, password)
        const me = await authApi.me()
        if (!["admin", "superadmin", "moderator"].includes(me.user.role)) {
          await authApi.logout().catch(() => undefined)
          throw new Error("У этой учётной записи нет доступа к панели администратора")
        }
        set({
          isAuthenticated: true,
          isReady: true,
          user: sessionFromMe(me, "admin"),
        })
      },

      registerWithCredentials: async ({
        email,
        password,
        first_name,
        last_name,
        phone,
        role,
      }) => {
        if (!isApiEnabled()) {
          get().login({
            email,
            role,
            name: `${first_name} ${last_name}`.trim(),
          })
          return
        }

        const apiRole = role === "supplier" ? "supplier" : "buyer"
        await authApi.register({
          email,
          password,
          first_name,
          last_name,
          phone: phone || undefined,
          role: apiRole,
        })
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
          isReady: true,
          user: sessionFromMe(me, role),
        })
      },

      restoreSession: async (role) => {
        if (!isApiEnabled()) return false
        if (!tokenStorage.getAccess() && !tokenStorage.getRefresh()) return false
        try {
          let me = await authApi.me()
          let active = pickActorForRole(me.actors, role, me.active_actor_id)
          if (!active) {
            try {
              me = await authApi.activateRole(sideForRole(role))
              active = pickActorForRole(me.actors, role, me.active_actor_id)
            } catch {
              return false
            }
          }
          if (!active) return false
          set({
            isAuthenticated: true,
            isReady: true,
            user: sessionFromMe(me, role),
          })
          return true
        } catch {
          set({ user: null, isAuthenticated: false, isReady: true })
          return false
        }
      },

      logout: async () => {
        if (isApiEnabled()) {
          await authApi.logout()
        }
        set({ user: null, isAuthenticated: false, isReady: true })
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        nextUserId: state.nextUserId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useAuthStore.setState({ user: null, isAuthenticated: false, isReady: true })
          return
        }
        if (state?.user) {
          state.user = migrateUser(state.user)
        }
        useAuthStore.setState({ isReady: true })
      },
      merge: (persisted, current) => {
        // Login can finish before rehydration. Never wipe a live session
        // with a stale localStorage snapshot (e.g. previous customer role).
        if (current.isAuthenticated && current.user) {
          return {
            ...current,
            isReady: true,
          }
        }
        const merged = { ...current, ...(persisted as Partial<AuthState>) }
        if (merged.user) {
          merged.user = migrateUser(merged.user)
        }
        return {
          ...merged,
          isReady: true,
        }
      },
    },
  ),
)

if (typeof window !== "undefined") {
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ isReady: true })
  })
  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.setState({ isReady: true })
  }
}
