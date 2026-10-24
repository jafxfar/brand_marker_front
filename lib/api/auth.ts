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
    totp_enabled?: boolean
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
  permissions?: string[]
  staff_role?: {
    id: number
    name: string
    description: string | null
  } | null
}

export type LoginChallenge = {
  requires_2fa: true
  challenge_token: string
  role?: "buyer" | "supplier" | null
}

export type LoginResult = TokenPair | LoginChallenge

export type TwoFactorSetup = {
  otpauth_url: string
  secret: string
  backup_codes: string[]
  qr_data_url: string
}

export const isLoginChallenge = (value: LoginResult): value is LoginChallenge =>
  Boolean(
    value &&
      typeof value === "object" &&
      "requires_2fa" in value &&
      (value as LoginChallenge).requires_2fa &&
      typeof (value as LoginChallenge).challenge_token === "string",
  )

export const authApi = {
  login: async (
    email: string,
    password: string,
    role?: "buyer" | "supplier",
  ): Promise<LoginResult> => {
    const data = await apiFetch<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, ...(role ? { role } : {}) }),
      skipAuth: true,
    })
    if (isLoginChallenge(data)) {
      return data
    }
    tokenStorage.setTokens(data)
    tokenStorage.clearActor()
    return data
  },

  verify2fa: async (challengeToken: string, code: string): Promise<TokenPair> => {
    const data = await apiFetch<TokenPair>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ challenge_token: challengeToken, code }),
      skipAuth: true,
    })
    tokenStorage.setTokens(data)
    tokenStorage.clearActor()
    return data
  },

  setup2fa: () =>
    apiFetch<TwoFactorSetup>("/auth/2fa/setup", {
      method: "POST",
    }),

  confirm2fa: (code: string) =>
    apiFetch<MeResponse["user"]>("/auth/2fa/confirm", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  disable2fa: (password: string, code: string) =>
    apiFetch<MeResponse["user"]>("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ password, code }),
    }),

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
    tokenStorage.clearActor()
    return data
  },

  me: () => apiFetch<MeResponse>("/auth/me"),

  logout: async () => {
    const refresh = tokenStorage.getRefresh()
    if (refresh) {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refresh }),
        skipAuth: true,
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
