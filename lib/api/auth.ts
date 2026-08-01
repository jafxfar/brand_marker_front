import { apiFetch, tokenStorage, type TokenPair } from "./client"

export type ActorSummary = {
  id: number
  kind: "individual" | "company"
  side: "buyer" | "supplier"
  display_name: string
  trust_level: string
  company_id: number | null
  verification_status: string | null
  company_role: string | null
}

export type MeResponse = {
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone: string | null
    role: string
    status: string
  }
  actors: ActorSummary[]
  active_actor_id: number | null
  capabilities: {
    buyer: boolean
    supplier: boolean
  }
  companies: Array<{
    id: number
    title: string
    actor_type: string
    verification_status: string
    role: string | null
  }>
  active_company_id: number | null
}

export const authApi = {
  login: async (email: string, password: string): Promise<TokenPair> => {
    const data = await apiFetch<TokenPair>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    tokenStorage.setTokens(data)
    return data
  },

  register: async (payload: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
    role: "buyer" | "supplier" | "both"
  }): Promise<TokenPair> => {
    const data = await apiFetch<TokenPair>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    })
    tokenStorage.setTokens(data)
    return data
  },

  me: () => apiFetch<MeResponse>("/auth/me"),

  logout: async () => {
    const refresh = tokenStorage.getRefresh()
    if (refresh) {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refresh }),
      }).catch(() => undefined)
    }
    tokenStorage.clear()
  },

  switchActor: (actorId: number) =>
    apiFetch<MeResponse>("/auth/switch-actor", {
      method: "POST",
      body: JSON.stringify({ actor_id: actorId }),
    }),

  switchCompany: (companyId: number) =>
    apiFetch<MeResponse>("/auth/switch-company", {
      method: "POST",
      body: JSON.stringify({ company_id: companyId }),
    }),

  activateRole: (side: "buyer" | "supplier") =>
    apiFetch<MeResponse>("/auth/activate-role", {
      method: "POST",
      body: JSON.stringify({ side }),
    }),

  updateProfile: (data: {
    first_name?: string
    last_name?: string
    phone?: string | null
  }) =>
    apiFetch<MeResponse["user"]>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}
