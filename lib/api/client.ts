import { API_URL } from "./config"

export type ApiError = {
  status: number
  message: string
  code?: string
}

export const getApiErrorMessage = (err: unknown, fallback: string): string =>
  err && typeof err === "object" && "message" in err
    ? String((err as ApiError).message)
    : err instanceof Error
      ? err.message
      : fallback

export type TokenPair = {
  access_token: string
  refresh_token: string
}

const TOKEN_KEY = "bm-access-token"
const REFRESH_KEY = "bm-refresh-token"
const ACTOR_KEY = "bm-actor-id"
const COMPANY_KEY = "bm-company-id"

export const tokenStorage = {
  getAccess: (): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  getRefresh: (): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY),
  getActorId: (): number | null => {
    if (typeof window === "undefined") return null
    const v = localStorage.getItem(ACTOR_KEY)
    return v ? Number(v) : null
  },
  getCompanyId: (): number | null => {
    if (typeof window === "undefined") return null
    const v = localStorage.getItem(COMPANY_KEY)
    return v ? Number(v) : null
  },
  setTokens: (tokens: TokenPair) => {
    localStorage.setItem(TOKEN_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
  },
  setActorId: (id: number) => {
    localStorage.setItem(ACTOR_KEY, String(id))
    localStorage.removeItem(COMPANY_KEY)
  },
  setCompanyId: (id: number) => {
    localStorage.setItem(COMPANY_KEY, String(id))
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(ACTOR_KEY)
    localStorage.removeItem(COMPANY_KEY)
  },
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  })
  if (!res.ok) {
    tokenStorage.clear()
    return null
  }
  const data = (await res.json()) as TokenPair
  tokenStorage.setTokens(data)
  return data.access_token
}

export const apiFetch = async <T>(
  path: string,
  options: RequestInit & {
    actorId?: number | null
    companyId?: number | null
    skipAuth?: boolean
  } = {},
): Promise<T> => {
  const { actorId, companyId, skipAuth, ...init } = options
  const headers = new Headers(init.headers)

  if (!skipAuth) {
    let token = tokenStorage.getAccess()
    if (!token) {
      token = await refreshAccessToken()
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const activeActor = actorId ?? tokenStorage.getActorId()
  if (activeActor) {
    headers.set("X-Actor-Id", String(activeActor))
  } else {
    const activeCompany = companyId ?? tokenStorage.getCompanyId()
    if (activeCompany) {
      headers.set("X-Company-Id", String(activeCompany))
    }
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (res.status === 401 && !skipAuth) {
    const newToken = await (refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    }))
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`)
      res = await fetch(`${API_URL}${path}`, { ...init, headers })
    }
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const err = await res.json()
      message = err.detail ?? err.message ?? message
    } catch {
      // ignore
    }
    const error: ApiError = { status: res.status, message: String(message) }
    throw error
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}
